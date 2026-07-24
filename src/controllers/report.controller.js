const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const ApiResponse = require('../utils/ApiResponse');

// تقرير الأرباح والخسائر
exports.getProfitLossReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // تحديد نطاق التاريخ
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    // 1. المبيعات
    const salesData = await Sale.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          costOfGoodsSold: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } // ملاحظة: هنا نقص حساب التكلفة الحقيقية، بس كإجمالي مبيعات
        }
      }
    ]);

    // 2. المشتريات
    const purchasesData = await Purchase.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, totalPurchases: { $sum: '$totalAmount' } } }
    ]);

    // 3. المصروفات
    const expensesData = await Expense.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);

    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
    const totalPurchases = purchasesData.length > 0 ? purchasesData[0].totalPurchases : 0;
    const totalExpenses = expensesData.length > 0 ? expensesData[0].totalExpenses : 0;

    // صافي الربح المتوقع = المبيعات - المصروفات (حساب مبسط)
    const netProfit = totalSales - totalExpenses;

    const report = {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit,
    };

    res.status(200).json(new ApiResponse(200, report));
  } catch (error) {
    next(error);
  }
};
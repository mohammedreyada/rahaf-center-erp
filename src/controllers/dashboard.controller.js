const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. إحصائيات سريعة (عدد المنتجات، العملاء، الموردين)
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    
    // المنتجات اللي مخزونها قليل (أقل من 5)
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 5 } }).select('name stockQuantity');

    // 2. حساب إجمالي المبيعات والمشتريات
    const salesStats = await Sale.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalPaid: { $sum: '$paidAmount' } } }
    ]);
    const purchasesStats = await Purchase.aggregate([
      { $group: { _id: null, totalPurchases: { $sum: '$totalAmount' }, totalPaid: { $sum: '$paidAmount' } } }
    ]);

    const totalSales = salesStats.length > 0 ? salesStats[0].totalSales : 0;
    const totalPurchases = purchasesStats.length > 0 ? purchasesStats[0].totalPurchases : 0;

    // 3. حساب صافي الربح المتوقع (المبيعات - تكلفة البضاعة المباعة)
    // هنجيب تكلفة كل صنف في فواتير البيع ونطرحها من إجمالي البيع
    const profitData = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$items.total' }, // إجمالي بيع المنتجات بدون ضريبة
        }
      }
    ]);
    
    // ملاحظة: حساب التكلفة الحقيقية بيكون معقد شوية، بس هنحسب الـ Revenue كإحصائية مبدئية
    const totalRevenue = profitData.length > 0 ? profitData[0].revenue : 0;

    // 4. آخر 5 فواتير بيع
    const recentSales = await Sale.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber totalAmount paymentStatus createdAt');

    // 5. مبيعات آخر 7 أيام (لرسم بياني)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      counts: {
        totalProducts,
        totalCustomers,
        totalSuppliers,
        lowStockProducts,
      },
      financials: {
        totalSales,
        totalPurchases,
        totalRevenue,
      },
      recentSales,
      dailySales,
    };

    res.status(200).json(new ApiResponse(200, stats));
  } catch (error) {
    next(error);
  }
};
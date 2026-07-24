const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const uuid = require('uuid');

// @desc    Create new purchase
// @route   POST /api/v1/purchases
// @access  Private
exports.createPurchase = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { items, supplier, paidAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'No items in the purchase');
    }

    let subTotal = 0;
    const purchaseItems = [];

    // 1. التحقق من المنتجات وزيادة المخزون
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(404, `Product not found with id ${item.product}`);
      }

      const itemTotal = item.costPrice * item.quantity;
      subTotal += itemTotal;

      purchaseItems.push({
        product: product._id,
        name: product.name,
        costPrice: item.costPrice,
        quantity: item.quantity,
        total: itemTotal,
      });

      // 2. زيادة كمية المخزون وتحديث سعر التكلفة للمنتج
      product.stockQuantity += item.quantity;
      product.costPrice = item.costPrice; // تحديث سعر التكلفة بآخر سعر شراء
      await product.save({ session });
    }

    const totalAmount = subTotal;

    // 3. تحديد حالة الدفع
    let paymentStatus = 'paid';
    let finalPaidAmount = totalAmount;
    if (paymentMethod === 'credit' && supplier) {
      finalPaidAmount = paidAmount || 0;
      if (finalPaidAmount >= totalAmount) {
        paymentStatus = 'paid';
      } else if (finalPaidAmount > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'unpaid';
      }
    }

    // 4. توليد رقم الفاتورة
    const timestamp = Date.now().toString().slice(-8);
    const randomStr = uuid.v4().slice(0, 4).toUpperCase();
    const invoiceNumber = `PUR-${timestamp}`;

    // 5. إنشاء فاتورة الشراء
    const purchase = await Purchase.create([{
      invoiceNumber,
      supplier: supplier || null,
      user: req.user.id,
      items: purchaseItems,
      subTotal,
      totalAmount,
      paidAmount: finalPaidAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus,
    }], { session });

    // 6. تحديث رصيد المورد لو اتشتري على الحساب
    if (supplier && paymentMethod === 'credit') {
      const remainingAmount = totalAmount - finalPaidAmount;
      if (remainingAmount > 0) {
        await Supplier.findByIdAndUpdate(
          supplier,
          { $inc: { balance: -remainingAmount } }, // بالسالب يعني إحنا مديونين ليه (لهم فلوس عندنا)
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(new ApiResponse(201, purchase[0], 'Purchase created successfully'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get all purchases
// @route   GET /api/v1/purchases
// @access  Private
exports.getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name company phone')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, purchases));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single purchase by ID
// @route   GET /api/v1/purchases/:id
// @access  Private
exports.getPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name company phone address')
      .populate('user', 'name');
      
    if (!purchase) return next(new ApiError(404, 'Purchase not found'));
    res.status(200).json(new ApiResponse(200, purchase));
  } catch (error) {
    next(error);
  }
};
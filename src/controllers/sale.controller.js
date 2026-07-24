const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const uuid = require('uuid');
const { sendNotification } = require('../sockets/notification.socket');

// @desc    Create new sale (Invoice)
// @route   POST /api/v1/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { items, customer, taxRate, discount, paidAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'No items in the sale');
    }

    let subTotal = 0;
    const saleItems = [];

    // 1. التحقق من المنتجات وحساب الإجمالي الفرعي
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(404, `Product not found with id ${item.product}`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
      }

      const itemTotal = product.sellingPrice * item.quantity;
      subTotal += itemTotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        price: product.sellingPrice,
        quantity: item.quantity,
        total: itemTotal,
      });

      // 2. خصم الكمية من المخزون
      product.stockQuantity -= item.quantity;
      await product.save({ session });
    }

    // 3. حساب الضريبة والإجمالي النهائي
    const taxAmount = (subTotal * (taxRate || 0)) / 100;
    const discountAmount = (subTotal * (discount || 0)) / 100;
    const totalAmount = subTotal + taxAmount - discountAmount;

    // 4. تحديد حالة الدفع
    let paymentStatus = 'paid';
    let finalPaidAmount = totalAmount;
    if (paymentMethod === 'credit' && customer) {
      finalPaidAmount = paidAmount || 0;
      if (finalPaidAmount >= totalAmount) {
        paymentStatus = 'paid';
      } else if (finalPaidAmount > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'unpaid';
      }
    }

    // 5. توليد رقم الفاتورة والباركود
    const timestamp = Date.now().toString().slice(-8);
    const randomStr = uuid.v4().slice(0, 4).toUpperCase();
    const invoiceNumber = `INV-${timestamp}`;
    const barcode = `*${timestamp}${randomStr}*`;

    // 6. إنشاء الفاتورة
    const sale = await Sale.create([{
      invoiceNumber,
      barcode,
      customer: customer || null,
      cashier: req.user.id,
      items: saleItems,
      subTotal,
      taxRate: taxRate || 0,
      taxAmount,
      discount: discount || 0,
      totalAmount,
      paidAmount: finalPaidAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus,
    }], { session });

    // 7. تحديث رصيد العميل لو اتباع على الحساب
    if (customer && paymentMethod === 'credit') {
      const remainingAmount = totalAmount - finalPaidAmount;
      if (remainingAmount > 0) {
        await Customer.findByIdAndUpdate(
          customer,
          { $inc: { balance: -remainingAmount } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    // ===== كود الإشعارات اللحظية الذكية =====
    const settings = await Setting.findOne();
    const threshold = settings ? settings.lowStockThreshold : 5;

    // 1. فحص نقص المخزون بعد البيع
    for (const item of saleItems) {
      const updatedProduct = await Product.findById(item.product);
      if (updatedProduct && updatedProduct.stockQuantity <= threshold) {
        await sendNotification(
          null, 'admin', 'Low Stock Alert', 
          `${updatedProduct.name} is running low on stock (${updatedProduct.stockQuantity} left).`, 
          'warning', '/products'
        );
      }
    }

    // 2. تنبيه القسط (البيع الآجل)
    if (paymentMethod === 'credit' && customer) {
      const customerData = await Customer.findById(customer);
      const remainingDebt = Math.abs(customerData.balance);
      await sendNotification(
        null, 'admin', 'Installment Due Alert', 
        `Customer ${customerData.name} has an outstanding debt of ${remainingDebt} EGP.`, 
        'danger', '/customers'
      );
    }
    // =======================================

    res.status(201).json(new ApiResponse(201, sale[0], 'Sale created successfully'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/v1/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'name phone')
      .populate('cashier', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, sales));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/v1/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('cashier', 'name');
      
    if (!sale) return next(new ApiError(404, 'Sale not found'));
    res.status(200).json(new ApiResponse(200, sale));
  } catch (error) {
    next(error);
  }
};
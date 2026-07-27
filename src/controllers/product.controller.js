const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Setting = require('../models/Setting');
const { sendNotification } = require('../sockets/notification.socket');

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Admin/Manager/Inventory)
exports.createProduct = async (req, res, next) => {
  try {
    // لو فيه صورة اترفعت، نحط مسارها، لو مفيش نخليه فاضي
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    } else {
      req.body.image = '';
    }

    const product = await Product.create(req.body);

    // إشعار لو المنتج اتضاف ومخزونه قليل من البداية
    const settings = await Setting.findOne();
    const threshold = settings ? settings.lowStockThreshold : 5;
    if (product.stockQuantity <= threshold) {
      await sendNotification(
        null, 'admin', 'Low Stock Alert', 
        `${product.name} is running low on stock (${product.stockQuantity} left).`, 
        'warning', '/products'
      );
    }

    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (with optional search & pagination)
// @route   GET /api/v1/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { barcode: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, products));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }
    res.status(200).json(new ApiResponse(200, product));
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Admin/Manager/Inventory)
exports.updateProduct = async (req, res, next) => {
  try {
    // لو فيه صورة اترفعت، نحط مسارها
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === 'object') {
      // لو مفيش صورة جديدة والقيمة الجاية object فاضي، نحذفها عشان سيب القديمة
      delete req.body.image;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // إشعار لو مخزون المنتج بقى أقل من الحد المسموح بعد التعديل
    const settings = await Setting.findOne();
    const threshold = settings ? settings.lowStockThreshold : 5;
    if (product.stockQuantity <= threshold) {
      await sendNotification(
        null, 'admin', 'Low Stock Alert', 
        `${product.name} is running low on stock (${product.stockQuantity} left).`, 
        'warning', '/products'
      );
    }

    res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }
    await product.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Admin/Manager/Inventory)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
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
    // بحث بسيط بالاسم أو الباركود
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
      .populate('category', 'name') // جلب اسم القسم فقط
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // يرجع المنتج بعد التعديل
      runValidators: true, // يشغل التحققات بتاعة الموديل
    });

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
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
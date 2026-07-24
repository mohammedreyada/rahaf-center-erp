const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private (Admin/Manager)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return next(new ApiError(400, 'Category already exists'));
    }

    const category = await Category.create({ name, description });
    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, categories));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }
    res.status(200).json(new ApiResponse(200, category));
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin/Manager)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    category.name = name || category.name;
    category.description = description || category.description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();
    res.status(200).json(new ApiResponse(200, updatedCategory, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }
    
    // TODO: هنحتاج نكمل هنا عشان نمنع حذف القسم لو فيه منتجات مربوطة بيه
    
    await category.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};
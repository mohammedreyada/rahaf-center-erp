const Supplier = require('../models/Supplier');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(new ApiResponse(201, supplier, 'Supplier created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, suppliers));
  } catch (error) {
    next(error);
  }
};

exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return next(new ApiError(404, 'Supplier not found'));
    res.status(200).json(new ApiResponse(200, supplier));
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return next(new ApiError(404, 'Supplier not found'));
    res.status(200).json(new ApiResponse(200, supplier, 'Supplier updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return next(new ApiError(404, 'Supplier not found'));
    await supplier.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Supplier deleted successfully'));
  } catch (error) {
    next(error);
  }
};
const Expense = require('../models/Expense');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(new ApiResponse(201, expense, 'Expense created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    // فلترة بالتاريخ لو اتطلب
    let query = {};
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });
      
    res.status(200).json(new ApiResponse(200, expenses));
  } catch (error) {
    next(error);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('createdBy', 'name');
    if (!expense) return next(new ApiError(404, 'Expense not found'));
    res.status(200).json(new ApiResponse(200, expense));
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) return next(new ApiError(404, 'Expense not found'));
    res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return next(new ApiError(404, 'Expense not found'));
    await expense.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Expense deleted successfully'));
  } catch (error) {
    next(error);
  }
};
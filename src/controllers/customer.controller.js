const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(new ApiResponse(201, customer, 'Customer created successfully'));
  } catch (error) { next(error); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, customers));
  } catch (error) { next(error); }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return next(new ApiError(404, 'Customer not found'));
    res.status(200).json(new ApiResponse(200, customer));
  } catch (error) { next(error); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!customer) return next(new ApiError(404, 'Customer not found'));
    res.status(200).json(new ApiResponse(200, customer, 'Customer updated successfully'));
  } catch (error) { next(error); }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return next(new ApiError(404, 'Customer not found'));
    await customer.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Customer deleted successfully'));
  } catch (error) { next(error); }
};

exports.collectPayment = async (req, res, next) => {
  try {
    const { amount, method, note } = req.body;
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) return next(new ApiError(404, 'Customer not found'));
    if (amount <= 0) return next(new ApiError(400, 'Amount must be greater than 0'));

    await Payment.create({
      customer: customer._id,
      amount,
      method: method || 'cash',
      note,
      createdBy: req.user.id
    });

    customer.balance += amount;
    await customer.save();

    res.status(200).json(new ApiResponse(200, customer, 'Payment collected successfully'));
  } catch (error) { next(error); }
};

exports.getCustomerStatement = async (req, res, next) => {
  try {
    const customerId = req.params.id;

    const sales = await Sale.find({ customer: customerId, paymentStatus: { $ne: 'paid' } })
      .select('invoiceNumber totalAmount paidAmount createdAt')
      .sort({ createdAt: 1 });

    const payments = await Payment.find({ customer: customerId })
      .select('amount method note createdAt')
      .sort({ createdAt: 1 });

    const customer = await Customer.findById(customerId);

    res.status(200).json(new ApiResponse(200, {
      customer,
      sales,
      payments,
      currentBalance: customer.balance
    }));
  } catch (error) { next(error); }
};
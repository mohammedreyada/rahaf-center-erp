const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, users));
  } catch (error) { next(error); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(new ApiError(404, 'User not found'));
    res.status(200).json(new ApiResponse(200, user));
  } catch (error) { next(error); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return next(new ApiError(400, 'User already exists'));
    
    const user = await User.create({ name, email, password, phone, role });
    res.status(201).json(new ApiResponse(201, { ...user.toObject(), password: undefined }, 'User created successfully'));
  } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.password) user.password = req.body.password; // الـ pre save هيشفره تلقائياً

    const updatedUser = await user.save();
    res.status(200).json(new ApiResponse(200, { ...updatedUser.toObject(), password: undefined }, 'User updated successfully'));
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));
    await user.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
  } catch (error) { next(error); }
};
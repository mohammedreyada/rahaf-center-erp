const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Register user (Admin only can create users later, but let's add an initial register route)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ApiError(400, 'User already exists'));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'cashier',
    });

    const token = user.getSignedJwtToken();
    
    // mhn3rdsh el password fel response
    const userData = { ...user.toObject() };
    delete userData.password;

    res.status(201).json(new ApiResponse(201, { user: userData, token }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // validate email & password
    if (!email || !password) {
      return next(new ApiError(400, 'Please provide an email and password'));
    }

    // Check for user (we use +password because we set select:false in model)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid credentials'));
    }

    const token = user.getSignedJwtToken();
    
    const userData = { ...user.toObject() };
    delete userData.password;

    res.status(200).json(new ApiResponse(200, { user: userData, token }, 'Logged in successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(new ApiResponse(200, user));
  } catch (error) {
    next(error);
  }
};
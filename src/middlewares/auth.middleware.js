const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return next(new ApiError(401, 'Not authorized, user not found'));
      }
      if (!req.user.isActive) {
        return next(new ApiError(403, 'Your account has been deactivated'));
      }
      next();
    } catch (error) {
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }
  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
};

module.exports = { protect };
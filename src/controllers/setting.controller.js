const Setting = require('../models/Setting');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    // عادة بيكون فيه صف إعدادات واحد بس
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json(new ApiResponse(200, settings));
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private (Admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
  } catch (error) {
    next(error);
  }
};
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user.id }, { user: null }]
    }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(new ApiResponse(200, notifications));
  } catch (error) { next(error); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
  } catch (error) { next(error); }
};
const { getIO } = require('../config/socket');
const Notification = require('../models/Notification');

exports.sendNotification = async (userId, role, title, message, type = 'info', link = '') => {
  try {
    // 1. حفظ الإشعار في الداتابيز
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link
    });

    // 2. إرسال الإشعار لحظياً (Real-time)
    const io = getIO();
    if (userId) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    } else if (role) {
      io.to(`role_${role}`).emit('new_notification', notification);
    } else {
      io.emit('new_notification', notification); // للكل
    }

    return notification;
  } catch (error) {
    console.error('Socket Notification Error:', error);
  }
};
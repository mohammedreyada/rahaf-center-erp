const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // المستخدم المستهدف (لو null يبقى للكل)
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'danger', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false },
  link: { type: String } // رابط للتوجيه لما يضغط عليها
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
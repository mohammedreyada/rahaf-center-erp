const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // مثلاً: CREATED_SALE, UPDATED_PRODUCT
  entityType: { type: String }, // مثلاً: Sale, Product
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object }, // تفاصيل إضافية
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
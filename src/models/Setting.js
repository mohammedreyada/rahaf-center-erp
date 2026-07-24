const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Rahaf Center',
    required: true,
  },
  storePhone: {
    type: String,
    default: '',
  },
  storeAddress: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: 'EGP', // الجنيه المصري
  },
  taxRate: {
    type: Number,
    default: 0, // نسبة الضريبة الافتراضية
  },
  logoUrl: {
    type: String,
    default: '',
  },
  // Low stock threshold (الحد الأدنى للتنبيه قبل نفاذ المخزون)
  lowStockThreshold: {
    type: Number,
    default: 5,
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
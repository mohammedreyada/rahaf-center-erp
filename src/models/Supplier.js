const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a supplier name'],
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  balance: {
    type: Number,
    default: 0, // لو بالسالب يبقى لهم فلوس، لو بالموجب يبقى اتدفع زيادة
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
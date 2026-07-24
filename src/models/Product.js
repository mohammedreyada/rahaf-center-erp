const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true, // بيسمح بوجود منتجات من غير باركود، بس لو موجود يبقى unique
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to a category'],
  },
  costPrice: {
    type: Number,
    required: [true, 'Please add a cost price'],
    default: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please add a selling price'],
    default: 0,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'gram', 'liter', 'box'],
    default: 'piece',
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
  },
}, { timestamps: true });

// عمل Index للبحث السريع
productSchema.index({ name: 'text', barcode: 'text' });

module.exports = mongoose.model('Product', productSchema);
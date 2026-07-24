const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true }, // اسم المنتج وقت البيع (عشان لو اتغير بعدين)
  price: { type: Number, required: true }, // سعر البيع وقت الفاتورة
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }, // price * quantity
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  barcode: {
    type: String,
    required: true,
    unique: true, // الباركود اللي هيتطبع على الفاتورة
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [saleItemSchema],
  subTotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 }, // نسبة الضريبة %
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // خصم بالنسبة المئوية %
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'credit'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'paid',
  },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
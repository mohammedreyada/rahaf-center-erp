const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'damage', 'adjustment'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  // المرجع: يعني الحركة دي جت من بيع مثلاً ولا من فاتورة شراء
  reference: {
    type: String, // مثلاً: SALE-1234 أو PURCHASE-5678
  },
  note: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
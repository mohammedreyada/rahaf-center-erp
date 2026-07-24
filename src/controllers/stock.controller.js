const Product = require('../models/Product');
const Setting = require('../models/Setting');
const ApiResponse = require('../utils/ApiResponse');

exports.getLowStockProducts = async (req, res, next) => {
  try {
    // نجيب الحد الأدنى من الإعدادات (لو مفيش إعدادات هنفترض 5)
    const settings = await Setting.findOne();
    const threshold = settings ? settings.lowStockThreshold : 5;

    const lowStockProducts = await Product.find({ 
      stockQuantity: { $lte: threshold } 
    }).populate('category', 'name');

    res.status(200).json(new ApiResponse(200, { threshold, products: lowStockProducts }));
  } catch (error) {
    next(error);
  }
};
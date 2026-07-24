const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getLowStockProducts } = require('../controllers/stock.controller');

router.use(protect);

router.route('/low-stock').get(getLowStockProducts);

module.exports = router;
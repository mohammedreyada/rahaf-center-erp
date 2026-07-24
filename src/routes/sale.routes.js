const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createSale, getSales, getSale } = require('../controllers/sale.controller');

router.use(protect);

router.route('/')
  .get(getSales)
  .post(authorize('admin', 'manager', 'cashier'), createSale);

router.route('/:id')
  .get(getSale);

module.exports = router;
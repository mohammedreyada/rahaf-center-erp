const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createPurchase, getPurchases, getPurchase } = require('../controllers/purchase.controller');

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(authorize('admin', 'manager', 'inventory'), createPurchase);

router.route('/:id')
  .get(getPurchase);

module.exports = router;
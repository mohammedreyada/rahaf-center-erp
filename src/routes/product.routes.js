const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/product.controller');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager', 'inventory'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager', 'inventory'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

module.exports = router;
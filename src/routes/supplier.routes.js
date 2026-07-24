const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
  createSupplier, 
  getSuppliers, 
  getSupplier, 
  updateSupplier, 
  deleteSupplier 
} = require('../controllers/supplier.controller');

router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(authorize('admin', 'manager', 'inventory'), createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(authorize('admin', 'manager', 'inventory'), updateSupplier)
  .delete(authorize('admin'), deleteSupplier);

module.exports = router;
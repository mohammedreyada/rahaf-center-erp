const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
  createCustomer, 
  getCustomers, 
  getCustomer, 
  updateCustomer, 
  deleteCustomer,
  collectPayment,
  getCustomerStatement
} = require('../controllers/customer.controller');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(authorize('admin', 'manager', 'cashier'), createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(authorize('admin', 'manager', 'cashier'), updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

// مسارات الدفعات وكشف الحساب
router.route('/:id/pay').put(authorize('admin', 'manager', 'cashier'), collectPayment);
router.route('/:id/statement').get(getCustomerStatement);

module.exports = router;
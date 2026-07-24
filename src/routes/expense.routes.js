const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
  createExpense, 
  getExpenses, 
  getExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expense.controller');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(authorize('admin', 'manager'), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(authorize('admin', 'manager'), updateExpense)
  .delete(authorize('admin'), deleteExpense);

module.exports = router;
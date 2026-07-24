const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { 
  createCategory, 
  getCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/category.controller');

// كل المسارات محمية وتحتاج تسجيل دخول
router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize('admin', 'manager'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(authorize('admin', 'manager'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

module.exports = router;
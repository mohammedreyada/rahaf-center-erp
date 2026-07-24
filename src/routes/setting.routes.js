const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { getSettings, updateSettings } = require('../controllers/setting.controller');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorize('admin'), updateSettings);

module.exports = router;
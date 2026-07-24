const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getDashboardStats } = require('../controllers/dashboard.controller');

router.use(protect);

router.route('/').get(getDashboardStats);

module.exports = router;
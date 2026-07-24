const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware'); // التصحيح هنا
const { getProfitLossReport } = require('../controllers/report.controller');

router.use(protect);

router.route('/profit-loss').get(authorize('admin', 'manager'), getProfitLossReport);

module.exports = router;
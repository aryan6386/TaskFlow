const express = require('express');
const { getStats, getOverdue } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/stats', getStats);
router.get('/overdue', getOverdue);

module.exports = router;

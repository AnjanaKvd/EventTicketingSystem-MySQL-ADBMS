const express = require('express');
const router = express.Router();
const { getEventReport } = require('../controllers/reportController');

// @route   GET /api/reports/event/:id
router.get('/reports/event/:id', getEventReport);

module.exports = router;
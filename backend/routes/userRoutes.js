const express = require('express');
const router = express.Router();
const { getMyBookings, getMyStats } = require('../controllers/userController');

// @route   GET /api/my-bookings
router.get('/my-bookings', getMyBookings);

// @route   GET /api/my-stats
router.get('/my-stats', getMyStats);

module.exports = router;
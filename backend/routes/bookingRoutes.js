const express = require('express');
const router = express.Router();
const { createBooking, cancelBooking } = require('../controllers/bookingController');

// @route   POST /api/bookings
router.post('/bookings', createBooking);

// @route   POST /api/bookings/cancel
router.post('/bookings/cancel', cancelBooking);

module.exports = router;
const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

// @route   POST /api/login
router.post('/login', login);

// @route   POST /api/register
router.post('/register', register);

module.exports = router;
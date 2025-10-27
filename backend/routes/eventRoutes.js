const express = require('express');
const router = express.Router();
const { 
    createEvent,
    getAllEvents, 
    getOneEvent, 
    checkStock, 
    updateEvent,
    deleteEvent 
} = require('../controllers/eventController');

// @route   POST /api/events
router.post('/events', createEvent);

// @route   GET /api/events
router.get('/events', getAllEvents);

// @route   GET /api/events/:id
router.get('/events/:id', getOneEvent);

// @route   PUT /api/events/:id
router.put('/events/:id', updateEvent);

// @route   GET /api/check-stock
router.get('/check-stock', checkStock);

// @route   DELETE /api/events/:id
router.delete('/events/:id', deleteEvent);


module.exports = router;
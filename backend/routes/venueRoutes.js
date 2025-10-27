const express = require('express');
const router = express.Router();
const { 
    createVenue,
    getAllVenues, 
    getOneVenue, 
    updateVenue,
    deleteVenue 
} = require('../controllers/venueController');

// @route   POST /api/venues
router.post('/venues', createVenue);

// @route   GET /api/venues
router.get('/venues', getAllVenues);

// @route   GET /api/venues/:id
router.get('/venues/:id', getOneVenue);

// @route   PUT /api/venues/:id
router.put('/venues/:id', updateVenue);

// @route   DELETE /api/venues/:id
router.delete('/venues/:id', deleteVenue);


module.exports = router;
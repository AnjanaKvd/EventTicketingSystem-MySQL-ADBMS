const express = require('express');
const router = express.Router();
const { 
    createTicket,
    deleteTicket,
    getAllTickets,
    getTicketsByEvent,
} = require('../controllers/ticketController');

// @route   POST /api/tickets
router.post('/tickets', createTicket);

// @route   GET /api/tickets
router.get('/tickets', getAllTickets);

// @route   GET /api/tickets/event/:eventId
router.get('/tickets/event/:eventId', getTicketsByEvent);

// @route   DELETE /api/tickets/:id
router.delete('/tickets/:id', deleteTicket);


module.exports = router;
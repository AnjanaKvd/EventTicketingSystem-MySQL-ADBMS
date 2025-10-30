const pool = require('../db');

exports.getAllTickets = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tickettypes');
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /api/tickets:', err.message);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
};
exports.createTicket = async (req, res) => {
    try {
        const { eventId, typeName, price, totalQuantity } = req.body;
        if (!eventId || !typeName || !price || !totalQuantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        await pool.query(
            'CALL sp_CreateTicketType(?, ?, ?, ?, @p_NewTicketTypeID, @p_Message)', 
            [eventId, typeName, price, totalQuantity] 
        );
        const [outputRows] = await pool.query('SELECT @p_NewTicketTypeID AS newTicketTypeId, @p_Message AS message');
        const output = outputRows[0];
        res.status(201).json({ message: output.message, newTicketTypeId: output.newTicketTypeId });
    } catch (err) {
        console.error('Error in POST /api/tickets:', err.message);
        res.status(500).json({ message: 'Error creating ticket' });
    }
};
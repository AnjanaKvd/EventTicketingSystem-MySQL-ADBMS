const pool = require('../db');

exports.getTicketsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const query = 'SELECT TicketTypeID, TypeName, Price, Quantity FROM TicketTypes WHERE EventID = ? AND Quantity > 0';
        const [rows] = await pool.query(query, [eventId]);
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /api/tickets/event/:eventId:', err.message);
        res.status(500).json({ message: 'Error fetching ticket types' });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT t.TicketTypeID, e.Title, t.TypeName, t.Price, t.Quantity FROM TicketTypes t JOIN Events e ON t.EventID = e.EventID');
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

        const query = 'INSERT INTO TicketTypes (EventID, TypeName, Price, Quantity) VALUES (?, ?, ?, ?)';
        const params = [eventId, typeName, price, totalQuantity];
        const [result] = await pool.query(query, params);
        res.status(201).json({ 
            message: 'Ticket type created successfully', 
            newTicketTypeId: result.insertId 
        });

    } catch (err) {
        console.error('Error in POST /api/tickets:', err.message);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'Error: Invalid EventID. The event does not exist.' });
        }

        res.status(500).json({ message: 'Error creating ticket' });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM TicketTypes WHERE TicketTypeID = ?';
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket type not found' });
        }
        res.json({ message: 'Ticket type deleted successfully' });
    }
    catch (err) {
        console.error('Error in DELETE /api/tickets/:id:', err.message);
        res.status(500).json({ message: 'Error deleting ticket type' });
    }
};
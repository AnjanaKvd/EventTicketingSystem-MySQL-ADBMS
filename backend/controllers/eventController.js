const pool = require('../db');

exports.getAllEvents = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM v_upcomingevents');
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /api/events:', err.message);
        res.status(500).json({ message: 'Error fetching events' });
    }
};

exports.getOneEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                *, 
                fn_GetDaysUntilEvent(EventID) AS DaysRemaining,
                fn_GetEventTotalRevenue(EventID) AS TotalRevenue
            FROM v_upcomingevents 
            WHERE EventID = ?;
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in GET /api/events/:id:', err.message);
        res.status(500).json({ message: 'Error fetching event' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { managerId, venueId, title, description, eventStartTime, eventDurationHours } = req.body;
        
        if (!managerId || !venueId || !title || !description || !eventStartTime || !eventDurationHours) {
            return res.status(400).json({ message: 'Missing required fields: managerId, venueId, title, description, eventStartTime, eventDurationHours' });
        }
        const duration = parseInt(eventDurationHours, 10);
        if (isNaN(duration) || duration <= 0) {
             return res.status(400).json({ message: 'Invalid eventDurationHours. Must be a positive number.' });
        }
        await pool.query(
            'CALL sp_CreateEvent(?, ?, ?, ?, ?, ?, @p_NewEventID, @p_Message)', 
            [managerId, venueId, title, description, eventStartTime, duration] 
        );
        const [outputRows] = await pool.query('SELECT @p_NewEventID AS newEventId, @p_Message AS message');
        const output = outputRows[0];
        if (output.newEventId === null) {
            return res.status(400).json({ message: output.message });
        }
        res.status(201).json({ eventId: output.newEventId, message: output.message });

    } catch (err) {
        console.error('Error in POST /api/events:', err.message);
        res.status(500).json({ message: 'Server error creating event' });
    }
}

exports.checkStock = async (req, res) => {
    try {
        const { ticketTypeId, quantity } = req.query;
        if (!ticketTypeId || !quantity) {
            return res.status(400).json({ message: 'Missing ticketTypeId or quantity parameters' });
        }
        
        const query = 'SELECT fn_CheckStockAvailability(?, ?) AS isAvailable;';
        const [rows] = await pool.query(query, [ticketTypeId, quantity]);
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in GET /api/check-stock:', err.message);
        res.status(500).json({ message: 'Error checking stock' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerId, title, description } = req.body;

        if (!managerId || !title || !description) {
            return res.status(400).json({ message: 'Missing managerId, title, or description' });
        }

        const query = 'CALL sp_UpdateEventDetails(?, ?, ?, ?, @p_Message); SELECT @p_Message AS message;';
        const params = [id, managerId, title, description];
        
        const [results] = await pool.query(query, params);
        const output = results[1][0];

        if (output.message.startsWith('Error:')) {
            return res.status(403).json({ message: output.message }); // 403 Forbidden
        }

        res.json({ message: output.message });
    } catch (err) {
        console.error('Error in PUT /api/events/:id:', err.message);
        res.status(500).json({ message: 'Server error updating event' });
    }
};


exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerId } = req.body;
        if (!managerId) {
            return res.status(400).json({ message: 'Missing managerId in request body' });
        }

        const query = 'CALL sp_CancelEvent(?, ?, @p_Message); SELECT @p_Message AS message;';
        const params = [id, managerId];
        const [results] = await pool.query(query, params);
        const output = results[1][0];
        if (output.message.startsWith('Error:')) {
            return res.status(403).json({ message: output.message }); // 403 Forbidden
        }
        res.json({ message: output.message });
    } catch (err) {
        console.error('Error in DELETE /api/events/:id:', err.message);
        res.status(500).json({ message: 'Server error cancelling event' });
    }
};
const pool = require('../db');

exports.createBooking = async (req, res) => {
    try {
        const { customerId, ticketTypeId, quantity } = req.body;
        if (!customerId || !ticketTypeId || !quantity) {
            return res.status(400).json({ message: 'Missing required fields: customerId, ticketTypeId, quantity' });
        }
        await pool.query(
            'CALL sp_CreateBooking(?, ?, ?, @p_NewBookingID, @p_Message)', 
            [customerId, ticketTypeId, quantity]
        );
        const [outputRows] = await pool.query('SELECT @p_NewBookingID AS newBookingId, @p_Message AS message');
        const output = outputRows[0]; 

        if (output.newBookingId === null) {
            return res.status(400).json({ message: output.message });
        }

        res.status(201).json({
            message: output.message,
            bookingId: output.newBookingId
        });
    } catch (err) {
        console.error('Error in POST /api/bookings:', err.message);
        res.status(500).json({ message: 'Server error during booking process' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId, customerId } = req.body;
        if (!bookingId || !customerId) {
            return res.status(400).json({ message: 'Missing bookingId or customerId' });
        }

        const query = 'CALL sp_CancelBooking(?, ?, @p_Message); SELECT @p_Message AS message;';
        const [results] = await pool.query(query, [bookingId, customerId]);
        
        const output = results[1][0];
        
        if (output.message.startsWith('Error:')) {
            return res.status(400).json({ message: output.message });
        }

        res.json({ message: output.message });
    } catch (err) {
        console.error('Error in POST /api/bookings/cancel:', err.message);
        res.status(500).json({ message: 'Server error during cancellation' });
    }
};
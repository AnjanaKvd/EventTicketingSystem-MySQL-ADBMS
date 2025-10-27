const pool = require('../db');

exports.getMyBookings = async (req, res) => {
    try {
        const { customerId } = req.query;
        if (!customerId) {
            return res.status(400).json({ message: 'Missing customerId parameter' });
        }
        
        const [results] = await pool.query('CALL sp_GetUserBookingHistory(?)', [customerId]);
        
        res.json(results[0]);
    } catch (err) {
        console.error('Error in GET /api/my-bookings:', err.message);
        res.status(500).json({ message: 'Error fetching booking history' });
    }
};

exports.getMyStats = async (req, res) => {
    try {
        const { customerId } = req.query;
        if (!customerId) {
            return res.status(400).json({ message: 'Missing customerId parameter' });
        }

        const query = 'SELECT fn_GetUserTotalSpent(?) AS totalSpent;';
        const [rows] = await pool.query(query, [customerId]);
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in GET /api/my-stats:', err.message);
        res.status(500).json({ message: 'Error fetching user stats' });
    }
};
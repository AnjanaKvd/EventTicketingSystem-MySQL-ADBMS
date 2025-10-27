const pool = require('../db');

exports.getEventReport = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM v_eventsalesreport WHERE EventID = ?;';
        
        const [rows] = await pool.query(query, [id]);
        
        res.json(rows);
    } catch (err)
 {
        console.error('Error in GET /api/reports/event/:id:', err.message);
        res.status(500).json({ message: 'Error fetching event report' });
    }
};
const pool = require('../db');

exports.createVenue = async (req, res) => {
    try {
        const { name, address, location, capacity } = req.body;
        if (!name || !address || !location || !capacity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const query = 'INSERT INTO Venues (Name, Address, City, TotalCapacity) VALUES (?, ?, ?, ?)';
        const params = [name, address, location, capacity];
        const [result] = await pool.query(query, params);
        res.status(201).json({ venueId: result.insertId, message: 'Venue created successfully' });
    } catch (err) {
        console.error('Error in POST /api/venues:', err.message);
        res.status(500).json({ message: 'Server error creating venue' });
    }
};

exports.getAllVenues = async (req, res) => {
    try {
        const query = 'SELECT * FROM Venues';
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /api/venues:', err.message);
        res.status(500).json({ message: 'Error fetching venues' });
    }
};

exports.getOneVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM Venues WHERE VenueID = ?';
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in GET /api/venues/:id:', err.message);
        res.status(500).json({ message: 'Error fetching venue' });
    }
};
exports.updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, location, capacity } = req.body;
        if (!name || !address || !location || !capacity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const query = 'UPDATE Venues SET Name = ?, Address = ?, City = ?, TotalCapacity = ? WHERE VenueID = ?';
        const params = [name, address, location, capacity, id];
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json({ message: 'Venue updated successfully' });
    } catch (err) {
        console.error('Error in PUT /api/venues/:id:', err.message);
        res.status(500).json({ message: 'Server error updating venue' });
    }
};
exports.deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM Venues WHERE VenueID = ?';
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json({ message: 'Venue deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE /api/venues/:id:', err.message);
        res.status(500).json({ message: 'Server error deleting venue' });
    }
};
// 1. Import Dependencies
const express = require('express');
const cors = require('cors')
const pool = require('./db'); // Import our database connection pool
const bcrypt = require('bcrypt');

// 2. Initialize the Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Add Middleware
app.use(cors())
app.use(express.json());

// 4. Define API Endpoints (Routes)

/**
 * @route   GET /api/events
 * @desc    Get all upcoming events from the view
 * @access  Public
 */
app.get('/api/events', async (req, res) => {
    try {
        // 1. Get a connection from the pool and run the query
        // We use our pre-built view 'v_UpcomingEvents' here!
        const [rows] = await pool.query('SELECT * FROM v_UpcomingEvents');

        // 2. Send the data back as JSON
        res.json(rows);

    } catch (err) {
        // 3. If an error occurs, send a 500 (Internal Server Error)
        console.error('Error in GET /api/events:', err.message);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking by calling the stored procedure
 * @access  Public (in a real app, this would be private)
 */
app.post('/api/bookings', async (req, res) => {
    try {
        // 1. Get the input data from the request body
        const { customerId, ticketTypeId, quantity } = req.body;

        // 2. Validate the input (basic check)
        if (!customerId || !ticketTypeId || !quantity) {
            return res.status(400).json({ message: 'Missing required fields: customerId, ticketTypeId, quantity' });
        }

        // 3. Call the Stored Procedure
        // We use 'CALL' and pass parameters as an array.
        // We also select the OUT parameters in the same query.
        // 1️⃣ Call the procedure
        await pool.query('CALL sp_CreateBooking(?, ?, ?, @p_NewBookingID, @p_Message)', [customerId, ticketTypeId, quantity]);

        // 2️⃣ Fetch the OUT parameters
        const [outputRows] = await pool.query('SELECT @p_NewBookingID AS newBookingId, @p_Message AS message');
        const output = outputRows[0];

        // 4. Check the custom message from the stored procedure
        if (output.newBookingId === null) {
            // This is a business logic error (e.g., "Not enough tickets")
            return res.status(400).json({ message: output.message });
        }

        // 5. Success!
        res.status(201).json({
            message: output.message,
            bookingId: output.newBookingId
        });

    } catch (err) {
        // This catches database-level or server-level errors
        console.error('Error in POST /api/bookings:', err.message);
        res.status(500).json({ message: 'Server error during booking process' });
    }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by its ID
 * @access  Public
 */
app.get('/api/events/:id', async (req, res) => {
    try {
        // 1. Get the event ID from the URL parameter
        const { id } = req.params;

        // 2. Query the view using a placeholder to prevent SQL injection
        const [rows] = await pool.query(
            'SELECT * FROM v_UpcomingEvents WHERE EventID = ?', 
            [id]
        );

        // 3. Check if an event was found
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 4. Send the event data back (it's the first item in the array)
        res.json(rows[0]);

    } catch (err) {
        console.error('Error in GET /api/events/:id:', err.message);
        res.status(500).json({ message: 'Error fetching event' });
    }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate a user and get their details
 * @access  Public
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 2. Find the user by their email
        const [rows] = await pool.query(
            'SELECT UserID, PasswordHash, Role, Username FROM Users WHERE Email = ?', 
            [email]
        );

        // 3. Check if user exists
        if (rows.length === 0) {
            // Use a generic error for security (prevents user enumeration)
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // 4. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            // Passwords don't match
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 5. Success!
        // In a real app, you would generate a JWT (JSON Web Token) here.
        // For this project, we'll just send a success message.
        res.json({
            message: 'Login successful!',
            user: {
                userId: user.UserID,
                username: user.Username,
                role: user.Role
            }
        });

    } catch (err) {
        console.error('Error in POST /api/login:', err.message);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
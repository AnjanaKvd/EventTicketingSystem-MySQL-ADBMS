// 1. Import Dependencies
const express = require('express');
const cors =require('cors');

// 2. Initialize the Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Add Middleware
app.use(cors());
app.use(express.json());

// 4. Import and Use Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const venueRoutes = require('./routes/venueRoutes')
const ticketRoutes = require('./routes/ticketRoutes');

app.use('/api', authRoutes);    // Mounts /api/login, /api/register
app.use('/api', eventRoutes);   // Mounts /api/events, /api/check-stock
app.use('/api', bookingRoutes); // Mounts /api/bookings
app.use('/api', userRoutes);    // Mounts /api/my-bookings, /api/my-stats
app.use('/api', reportRoutes);  // Mounts /api/reports
app.use('/api', venueRoutes);   // Mounts /api/venues
app.use('/api', ticketRoutes);   // Mounts /api/tickets

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
const pool = require('../db');
const bcrypt = require('bcrypt');

// @desc    Authenticate a user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [rows] = await pool.query(
            'SELECT UserID, PasswordHash, Role, Username FROM Users WHERE Email = ?', 
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful!',
            user: {
                userId: user.UserID,
                username: user.Username,
                role: user.Role
            }
        });
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = 'CALL sp_RegisterUser(?, ?, ?, @p_NewUserID, @p_Message); SELECT @p_NewUserID AS newUserId, @p_Message AS message;';
        const [results] = await pool.query(query, [username, email, passwordHash]);

        const output = results[1][0];

        if (output.newUserId === null) {
            return res.status(400).json({ message: output.message });
        }

        res.status(201).json({
            message: output.message,
            userId: output.newUserId
        });

    } catch (err) {
        console.error('Error in register:', err.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
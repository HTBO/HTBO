const jwt = require('jsonwebtoken');
const BlacklistToken = require('./blacklistToken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

function generateToken(user, expiresIn = '1h') {
    return jwt.sign(
        {
            id: user._id,
            longSession: expiresIn === '30d'
        },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

async function invalidateToken (token) {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    await BlacklistToken.create({ token, expiresAt });
};

async function refreshToken(req, res) {
    try {
        const oldToken = req.header('Authorization')?.replace('Bearer ', '');
        if (!oldToken) return res.status(401).json({ error: 'Authorization required | ERRC: 010' });

        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found | ERRC: 031' });

        const newExpiration = decoded.longSession ? '30d' : '1h';

        await invalidateToken(oldToken);
        const newToken = generateToken(user, newExpiration);

        res.status(200).json({ token: newToken });
    } catch (err) {
        console.error(err.message);
        const errorMessage = err.name === 'TokenExpiredError'
            ? 'Login again | ERRC: 032'
            : 'Invalid token | ERRC: 033';
        res.status(401).json({ error: errorMessage });
    }
};

module.exports = {
    generateToken,
    invalidateToken,
    refreshToken
};
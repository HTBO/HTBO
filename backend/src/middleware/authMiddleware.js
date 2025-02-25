const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Session = require('../models/Session');

dotenv.config();

function verifyToken(req, res, next) {
    if (!req.header('Authorization')) return res.status(401).json({ error: 'Access denied | ERRC: 01' });
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

function checkUserPermission(req, res, next) {
    if (req.params.id !== String(req.userId)) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
}

async function checkSessionPermission (req, res, next) {
    const hostId = await Session.findById(req.params.id).select('hostId');
    if(req.userId !== String(hostId.hostId)) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
}

module.exports = { verifyToken, checkUserPermission, checkSessionPermission };
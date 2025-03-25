const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Session = require('../models/Session');
const Group = require('../models/Group');

dotenv.config();

function verifyToken(req, res, next) {
    if (!req.header('Authorization')) return res.status(401).json({ error: 'Access denied | ERRC: 01' });
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied | ERRC: 02' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

function checkUserPermission(req, res, next) {
    if (req.params.id !== String(req.userId))
        return res.status(403).json({ error: 'Unauthorized access | ERRC: 100' });
    next();
}

async function checkSessionPermission (req, res, next) {
    const hostId = await Session.findById(req.params.id).select('hostId');
    if(req.userId !== String(hostId.hostId)) 
        return res.status(403).json({ error: 'Unauthorized access | ERRC: 110' });
    next();
}

async function checkGroupPermission (req, res, next) {
    const ownerId = await Group.findById(req.params.id).select('ownerId');
    if(req.userId !== String(ownerId.ownerId)) 
        return res.status(403).json({ error: 'Unauthorized access | ERRC: 120' });
    next();
}

module.exports = { verifyToken, checkUserPermission, checkSessionPermission, checkGroupPermission };
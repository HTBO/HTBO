// middleware/wsAuth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { BlacklistToken } = require('../models/BlacklistToken');
const terminal = require('../utils/terminal');

dotenv.config();

const wsAuthMiddleware = async (socket, next) => {
  try {
    // Get token from handshake
    const token = socket.handshake.auth.token || 
                 socket.handshake.query.token;
    terminal.info(socket.handshake.query.token);

    if (!token) {
      terminal.warning('WS connection attempt without token');
      return next(new Error('Authentication error: No token provided | ERRC: 020'));
    }

    // Check blacklist
    const blacklisted = await BlacklistToken.findOne({ token });
    if (blacklisted) {
      terminal.warning(`WS blacklisted token attempt: ${token.substring(0, 15)}...`);
      return next(new Error('Authentication error: Token revoked | ERRC: 030'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to socket
    socket.user = {
      id: decoded.id,
      token: token
    };

    terminal.info(`WS authenticated user: ${decoded.id}`);
    next();
    
  } catch (error) {
    terminal.error(`WS auth error: ${error.message}`);
    next(new Error(`Authentication error: ${error.message}`));
  }
};

// Authorization middleware for specific events
async function checkWsSessionPermission(sessionId, userId) {
  const session = await Session.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (String(session.hostId) !== String(userId)) {
    throw new Error('Unauthorized session access | ERRC: 110');
  }
}

async function checkWsGroupPermission(groupId, userId) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  if (String(group.ownerId) !== String(userId)) 
    throw new Error('Unauthorized group access | ERRC: 120');
}

module.exports = { wsAuthMiddleware, checkWsSessionPermission, checkWsGroupPermission };
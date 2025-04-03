const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const terminal = require('./utils/terminal');
const http = require('http');
const { logDB } = require('./models/Log');
const { Server } = require('socket.io');
const { wsAuthMiddleware } = require('./middleware/webSocketAuth');

dotenv.config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

io.use(wsAuthMiddleware);

const validateEnvironment = () => {
  const requiredVars = ['MONGODB_URI', 'LOGS_MONGODB_URI', 'PORT', 'JWT_SECRET', 'JWT_EXPIRES_IN'];
  requiredVars.forEach(varName => {
    if (!process.env[varName])
      terminal.error(`Missing required environment variable: ${varName}`);
  });
};

const setupChangeStreams = () => {
  const db = mongoose.connection;
  console.log(db);
  
  const userChangeStream = db.collection('users').watch();
  const gameChangeStream = db.collection('games').watch();

  userChangeStream.on('change', (change) => {
    io.emit('user-change', change);
    terminal.info(`User collection change detected: ${change.operationType}`);
    console.log(change);
    
  });

  gameChangeStream.on('change', (change) => {
    io.emit('game-change', change);
    terminal.info(`Game collection change detected: ${change.operationType}`);
  });
};

validateEnvironment();

Promise.all([
  mongoose.connect(MONGODB_URI).catch(err => err),
  logDB.asPromise().catch(err => err)
])
  .then(([mainDB, logDB]) => {
    if (mainDB instanceof Error) {
      terminal.error('Main DB connection failed', mainDB);
      process.exit(1);
    }
    if (logDB instanceof Error) {
      terminal.error('Logs DB connection failed', logDB);
      process.exit(1);
    }
    terminal.success('All databases connected');

    setupChangeStreams();
    mongoose.connection.db.collection('rateLimits').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900 }, // 15 minutes
      (err) => {
        if (err) {
          terminal.error('Rate limit TTL index creation failed', err);
          process.exit(1);
        }
        else terminal.success('Rate limit TTL index created');
      }
    );

    app.listen(PORT, '0.0.0.0', () => {
      terminal.success(`All servers running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    terminal.error('Database connection failed', err);
    process.exit(1);
  });

io.on('connection', (socket) => {
  terminal.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    terminal.info(`Client disconnected: ${socket.id}`);
  });
});

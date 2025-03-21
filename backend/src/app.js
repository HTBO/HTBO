const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const Log = require('./models/Log');
const rateLimiter = require('./middleware/rateLimiter'); // New import

dotenv.config({ path: '../.env' });

const app = express();

app.set('trust proxy', true);

app.use((req, res, next) => {
  let ip = req.ip;
  if (ip === '::1') ip = '127.0.0.1';
  else if (ip.startsWith('::ffff:')) ip = ip.split(':').pop();
  req.clientIP = ip;
  next();
});

app.use(rateLimiter);

app.use((req, res, next) => {
  const logEntry = new Log({
    ip: req.clientIP,
    endpoint: req.originalUrl,
    method: req.method
  });
  logEntry.save()
    .catch(err => console.error('Failed to save log:', err));
  console.log(`\x1b[36m${req.clientIP}\x1b[0m - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(cors());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

module.exports = app;
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const {Log} = require('./models/Log');
const rateLimiter = require('./middleware/rateLimiter');

dotenv.config({ path: '../.env' });

const app = express();

app.set('trust proxy', true);

app.use((req, res, next) => {
  req.clientIP = req.ip.replace('::ffff:', '');
  next();
});

app.use(rateLimiter);

app.use((req, res, next) => {

  if (req.path.startsWith('/socket.io/')) return next();
  req.clientIP = req.ip.replace('::ffff:', '');
  next();
});


app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io/')) return next();
  if (req.clientIP == "127.0.0.1") return next();
  if (req.originalUrl.includes('favicon.ico')) return next();
  const logEntry = new Log({
    ip: req.clientIP,
    endpoint: req.originalUrl,
    method: req.method,
    visitTimes: 100 - (res.get('X-RateLimit-Remaining') ?? 101)
  });
  logEntry.save()
    .catch(err => console.error('Failed to save log:', err));
  next();
});

app.use(express.json());
app.use(cors());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

module.exports = app;
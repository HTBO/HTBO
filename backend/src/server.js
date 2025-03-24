const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const {logDB} = require('./models/Log');
const terminal = require('./utils/terminal');
dotenv.config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const validateEnvironment = () => {
  const requiredVars = ['MONGODB_URI'];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      // console.error(`\x1b[31mMissing required environment variable: ${varName}\x1b[0m`);
      terminal.error(`Missing required environment variable: ${varName}`);
    }
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
    // console.log('\x1b[36mAll databases connected\x1b[0m');
    terminal.success('All databases connected');
    mongoose.connection.db.collection('rateLimits').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900 }, // 15 minutes
      (err) => {
        if (err) {
          // console.error('Rate limit TTL index creation failed', err);
          terminal.error('Rate limit TTL index creation failed', err);
          process.exit(1);
        }
        // else console.log('Rate limit TTL index created');
        else terminal.success('Rate limit TTL index created');
      }
    );

    app.listen(PORT, '0.0.0.0',  () => {
      // console.log(`\x1b[32mServer running on port: \x1b[42m${PORT}\x1b[0m`);
      terminal.success(`Server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    // console.error('\x1b[31mDatabase connection failed\x1b[0m', err);
    terminal.error('Database connection failed', err);
    process.exit(1);
  });


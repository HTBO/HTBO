const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const validateEnvironment = () => {
  const requiredVars = ['MONGODB_URI'];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`\x1b[31mMissing required environment variable: ${varName}\x1b[0m`);
      process.exit(1);
    }
  });
};

validateEnvironment();

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\x1b[36mMongoDB connected successfully\x1b[0m');
    
    mongoose.connection.db.collection('rateLimits').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900 }, // 15 minutes
      (err) => {
        if (err) console.error('Rate limit TTL index error:', err);
        else console.log('Rate limit TTL index created');
      }
    );

    app.listen(PORT, () => {
      console.log(`\x1b[32mServer running on port: \x1b[42m${PORT}\x1b[0m`);
    });
  })
  .catch((err) => {
    console.error('\x1b[31mDatabase connection failed\x1b[0m', err);
  });
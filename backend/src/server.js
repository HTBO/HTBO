const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("\x1b[33m\x1b[45m\x1b[1mERROR: No database URL defined. Please set the MONGODB_URI environment variable\x1b[0m");
  // Gracefully stop the application
  return;
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
    console.log(`\x1b[32mServer running on port: \x1b[42m${PORT}\x1b[0m`);
    });
  })
  .catch((err) => {
    console.error('\x1b[33m\x1b[45m\x1b[1mDatabase connection failed\x1b[0m', err);
    // Gracefully stop the application
  });
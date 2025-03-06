const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
require('./config/firebase');
dotenv.config();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;


// if (!MONGODB_URI) {
//   console.error("\x1b[33m\x1b[45m\x1b[1mERROR: No database URL defined. Please set the MONGODB_URI environment variable\x1b[0m");
// }

const validateEnvironment = () => {
  const requiredVars = ['MONGODB_URI', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
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
    app.listen(PORT, () => {
      console.log(`\x1b[32mServer running on port: \x1b[42m${PORT}\x1b[0m`);
    });
  })
  .catch((err) => {
    console.error('\x1b[31mDatabase connection failed\x1b[0m', err);
  });
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     app.listen(PORT, () => {
//     console.log(`\x1b[32mServer running on port: \x1b[42m${PORT}\x1b[0m`);
//     });
//   })
//   .catch((err) => {
//     console.error('\x1b[33m\x1b[45m\x1b[1mDatabase connection failed\x1b[0m', err);
//   });
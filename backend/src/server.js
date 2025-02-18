const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) console.error("No database URL defined")

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed', err);
  });
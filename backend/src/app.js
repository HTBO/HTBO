const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
// const connectDB = require('./config/db');
require("./models/Store")

dotenv.config();

// connectDB();
const app = express();
// const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//     console.log(`Request: ${req.method} ${req.path}`);
//     next();
// })


app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/games', require('./routes/gameRoutes'))
app.use('/api/stores', require('./routes/storeRoutes'))
app.use('/api/sessions', require('./routes/sessionRoutes'))
app.use('/api/groups', require('./routes/groupRoutes'))

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


module.exports = app;


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/games', require('./routes/gameRoutes'))
app.use('/api/stores', require('./routes/storeRoutes'))
app.use('/api/sessions', require('./routes/sessionRoutes'))
app.use('/api/groups', require('./routes/groupRoutes'))

module.exports = app;


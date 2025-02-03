const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} ads`);
    next();
})

app.get('/', (req, res) => {
    res.json({message: 'Hello World!'});
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

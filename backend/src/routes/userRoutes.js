const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

let users = []; // Ideiglenes "adatbázis"

router.post('/register', userController.registerUser)


module.exports = router;
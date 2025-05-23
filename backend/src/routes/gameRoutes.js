const express = require('express');
const router = express.Router();
const igdbGameController = require('../controllers/igdbGameController');

router.post('/search', igdbGameController.searchGame);

module.exports = router;
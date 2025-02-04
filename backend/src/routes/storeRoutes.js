const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.post('/', storeController.createStore);
// router.get('/', gameController.getAllGames);
// router.get('/:id', gameController.getGameById);
// router.patch('/:id', gameController.updateGame);
// router.delete('/:id', gameController.deleteGame);

module.exports = router;
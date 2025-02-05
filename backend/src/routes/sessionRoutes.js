const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSessions);
// router.get('/:id', gameController.getGameById);
// router.patch('/:id', gameController.updateGame);
// router.delete('/:id', gameController.deleteGame);

module.exports = router;
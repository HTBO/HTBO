const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.patch('/:id', sessionController.updateSession);
// router.delete('/:id', gameController.deleteGame);

module.exports = router;
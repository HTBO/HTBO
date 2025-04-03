const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken, checkSessionPermission } = require('../middleware/authMiddleware');

router.get('/', verifyToken, sessionController.getAllSessions);
router.get('/:id', verifyToken, sessionController.getSessionById);
router.post('/', verifyToken, sessionController.createSession);
router.post('/confirm', verifyToken, sessionController.confirmSession);
router.post('/reject', verifyToken, sessionController.rejectSession);
// Protected routes
router.patch('/:id', verifyToken, checkSessionPermission, sessionController.updateSession);
router.delete('/:id', verifyToken, checkSessionPermission, sessionController.deleteSession);

module.exports = router;
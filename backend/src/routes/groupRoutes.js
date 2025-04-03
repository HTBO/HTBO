const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken, checkGroupPermission } = require('../middleware/authMiddleware');

router.post('/', verifyToken, groupController.createGroup);
router.post('/confirm', verifyToken, groupController.confirmGroup);
router.post('/reject', verifyToken, groupController.rejectGroup);
router.get('/', verifyToken ,groupController.getAllGroups);
router.get('/:id', verifyToken, groupController.getGroupById);
router.patch('/:id', verifyToken, checkGroupPermission, groupController.updateGroup);
router.delete('/:id', verifyToken, checkGroupPermission, groupController.deleteGroup);

module.exports = router;
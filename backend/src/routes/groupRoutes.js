const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);
router.patch('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

module.exports = router;
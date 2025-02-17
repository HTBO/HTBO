const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.get('/', userController.getAllUsers);
router.get('/username/:username', userController.getUserByUsername);
router.get('/:id', userController.getUserById);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
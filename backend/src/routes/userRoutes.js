const express = require('express');
const router = express.Router();
const { verifyToken, checkUserPermission } = require('../middleware/authMiddleware')
const userController = require('../controllers/userController')

router.get('/', userController.getAllUsers);
router.post('/register', userController.registerUser);
router.post('/login', (req, res) => {
    console.log('Login attempt from: ', req.ip);
    userController.loginUser(req, res);
});

// Protected routes
router.get('/username/:username',  userController.getUserByUsername);
router.get('/:id', verifyToken, userController.getUserById);
router.patch('/:id', verifyToken, checkUserPermission, userController.updateUser);
router.delete('/:id', verifyToken, checkUserPermission, userController.deleteUser);

module.exports = router;
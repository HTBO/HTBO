const express = require('express');
const router = express.Router();
const { verifyToken, checkUserPermission } = require('../middleware/authMiddleware')
const userController = require('../controllers/userController')

// Public routes
router.get('/', userController.getAllUsers);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected authorization routes
router.post('/refresh', verifyToken,userController.refreshToken);
router.post('/logout', verifyToken, userController.logoutUser);

// Protected info routes
router.get('/me', verifyToken, userController.getMyInfo);
router.get('/mysessions', verifyToken, userController.getMySessions);
router.get('/mygroups', verifyToken, userController.getMyGroups);
router.get('/myfriends', verifyToken, userController.getMyFriends);
router.get('/mygames', verifyToken, userController.getMyGames);

// Protected routes
router.get('/username/:username',  userController.getUserByUsername);
router.get('/:id', verifyToken, userController.getUserById);
router.patch('/:id', verifyToken, checkUserPermission, userController.updateUser);
router.delete('/:id', verifyToken, checkUserPermission, userController.deleteUser);


module.exports = router;

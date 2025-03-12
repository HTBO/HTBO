const express = require('express');
const FirestoreService = require('../services/firestore.service');
const router = express.Router();
const { verifyToken, checkUserPermission } = require('../middleware/authMiddleware')
const userController = require('../controllers/userController')
const userService = new FirestoreService('users');

// Firebase routes
router.post('/firebase', async (req, res) => {
    try {
      const { userId, userData } = req.body;
      const result = await userService.createDocument(userId, userData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Public routes
router.get('/', userController.getAllUsers);
router.post('/register', userController.registerUser);
router.post('/login', (req, res) => {
    // console.log('Login attempt from: ', req.ip);
    userController.loginUser(req, res);
});

// Protected routes
router.get('/username/:username',  userController.getUserByUsername);
router.get('/:id', verifyToken, userController.getUserById);
router.patch('/:id', verifyToken, checkUserPermission, userController.updateUser);
router.delete('/:id', verifyToken, checkUserPermission, userController.deleteUser);

module.exports = router;
const express = require('express');
const { verifyToken, checkUserPermission } = require('../middleware/authMiddleware');

class UserRouter {
  constructor(controller) {
    if(!controller) throw new Error('dik hianycikk');
    this.router = express.Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Public routes
    this.router.get('/', this.controller.getAllUsers.bind(this.controller));
    this.router.post('/register', this.controller.registerUser.bind(this.controller));
    this.router.post('/login', this.controller.loginUser.bind(this.controller));

    // Protected authorization routes
    // this.router.post('/refresh', verifyToken, this.controller.refreshToken.bind(this.controller));
    this.router.post('/logout', verifyToken, this.controller.logoutUser.bind(this.controller));

    // Protected info routes
    this.router.get('/me', verifyToken, this.controller.getMyInfo.bind(this.controller));
    this.router.get('/mysessions', verifyToken, this.controller.getMySessions.bind(this.controller));
    this.router.get('/mygroups', verifyToken, this.controller.getMyGroups.bind(this.controller));
    this.router.get('/myfriends', verifyToken, this.controller.getMyFriends.bind(this.controller));
    this.router.get('/mygames', verifyToken, this.controller.getMyGames.bind(this.controller));

    // Protected routes
    this.router.get('/username/:username', this.controller.getUserByUsername.bind(this.controller));
    this.router.get('/:id', verifyToken, this.controller.getUserById.bind(this.controller));
    this.router.patch('/:id', verifyToken, checkUserPermission, this.controller.updateUser.bind(this.controller));
    this.router.delete('/:id', verifyToken, checkUserPermission, this.controller.deleteUser.bind(this.controller));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = UserRouter;
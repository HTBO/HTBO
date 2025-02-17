const User = require('../models/User')
const Game = require('../models/Game')
const Session = require('../models/Session')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET ||"643182a59e492cbb1792e42caa29824f0af74889001ee940623ee2454b84a585550993ee561a14cb156279488120631e2d83bae755aeab0cef55ba4820690e6b"
    return jwt.sign(
        { id: user._id },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )
}

const registerUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] })
        if (existingUser) return res.status(400).json({
                error: existingUser.username === username ? 'Username already exists' : 'Email already registered'
            })

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            passwordHash,
            avatarUrl: req.body.avatarUrl || undefined
        });

        const token = generateToken(newUser)

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            avatarUrl: newUser.avatarUrl,
            token
        });
    } catch (err) {
        console.log(`${err.message} reg err`);
        res.status(500).json({ error: 'Server error' });

    }
};

const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user;
        if(username) {
            user = await User.findOne({ username });
            if (!user) return res.status(401).json({ error: 'Username or password does not match | ERRC:0' });
            login("Username")
        } else if(email){
            user = await User.findOne({ email });
            if (!user) return res.status(401).json({ error: 'Email or password does not match | ERRC:1' });
            login("Email")
        } else {
            return res.status(401).json({error: "Please provide an email or username"})
        }
        async function login (method) {
            if(!password) return res.status(401).json({error: "Please provide the password"})
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatch) return res.status(401).json({ error: `${method} or password does not match | ERRC:2` });
            token = generateToken(user);
            res.status(200).json({ token })
        }
    } catch (err) {
        console.log(`${err.message} login error.`);
        res.status(500).json({ error: 'Login failed' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET http://localhost:3000/api/users

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid user ID format' });
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ user })
    } catch (error) {
        console.error(error.message);
        if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid user ID format' });
        res.status(500).json({ error: 'Server error' });
    }
};


//GET http://localhost:3000/api/users/67a33d47a02aabac387293c3


const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (req.body.friendAction) {
            // PATCH http://localhost:3000/api/users/67a33d47a02aabac387293c3
            // {
            //     "friendAction": {
            //       "action": "add", 
            //       "friendId": "67a10f25d8074d134344b672"
            //     }
            //   }
            // {
            //     "friendAction": {
            //       "action": "update-status", 
            //       "friendId": "67a10f25d8074d134344b672",
            //       "status": "accepted"
            //     }
            //   }
            // {
            //     "friendAction": {
            //       "action": "remove", 
            //       "friendId": "67a10f25d8074d134344b672"
            //     }
            //   }
            const friendActions = ['pending', 'accepted', 'rejected']
            const { action, friendId, status } = req.body.friendAction;

            if (!mongoose.Types.ObjectId.isValid(friendId))
                return res.status(400).json({ error: 'Invalid friend ID format' });


            const addedFriend = await User.findById(friendId);
            switch (action) {
                case 'add':
                    if (user._id.toString() === friendId.toString())
                        return res.status(400).json({ error: 'Users cannot add themselves' });
                    if (user.friends.some(p => p.userId.toString() == friendId.toString()))
                        return res.status(400).json({ error: 'User already added' });

                    await user.addFriend(friendId);
                    await addedFriend.addFriend(user);
                    break;
                case 'remove':
                    // user.friends = user.friends.filter(friend => !friend.userId.equals(friendId));
                    // addedFriend.friends = addedFriend.friends.filter(friend => !friend.userId.equals(user));
                    await user.removeFriend();
                    await addedFriend.removeFriend();
                    // await user.save();
                    break;
                case 'update-status':
                    const friend = user.friends.find(friend => friend.userId.equals(friendId));
                    // console.log(req.params.id);
                    const addUser = addedFriend.friends.find(friend => friend.userId.equals(req.params.id))
                    if (!friend) return res.status(404).json({ error: 'Friend not found' });
                    if (!friendActions.includes(status)) return res.status(400).json({ error: 'Invalid status' });
                    if (!status == "rejected") {
                        friend.status = status;
                        addUser.status = status;
                        await user.statusUpdate();
                        await addedFriend.statusUpdate();
                    } else {
                        await user.removeFriend();
                        await addedFriend.removeFriend();
                    }
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid friend action' });
            }
        } else if (req.body.gameAction) {
            const { gameId, action } = req.body.gameAction;
            if (!mongoose.Types.ObjectId.isValid(gameId))
                return res.status(400).json({ error: 'Invalid game ID' });
            switch (action) {
                case "add":
                    // Check if user already has the game (using ObjectId)
                    if (user.games.some(g => g.gameId.equals(gameObjectId))) {
                        return res.status(400).json({ error: 'Game already in collection' });
                    }
                    await user.editUserGames(gameObjectId, "add");
                    break;

                case "remove":
                    // Check if user has the game (using ObjectId)
                    if (!user.games.some(g => g.gameId.equals(gameObjectId))) {
                        console.log(user.games);
                        console.log(gameObjectId);


                        return res.status(400).json({ error: 'Game not in collection' });
                    }
                    // await user.removeGame(gameObjectId);
                    await user.editUserGames(gameObjectId, "remove");
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid game action' });
            }
        } else if (req.body.sessionAction) {

            const { sessionId, action } = req.body.sessionAction;
            if (!mongoose.Types.ObjectId.isValid(sessionId))
                return res.status(400).json({ error: 'Invalid session ID' });
            const addedSession = await Session.findById(sessionId);
            // console.log(addedSession);
            switch (action) {
                case "add":
                    console.log("adding: " + sessionId);
                    await user.addSession(sessionId);
                    break;
                case "remove":
                    console.log("removing: " + sessionId);

                    await user.removeSession(sessionId);
                    break;
                default:
                    break;
            }
        } else {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['username', 'email'];
            const isValidOperation = updates.every(update =>
                allowedUpdates.includes(update)
            );

            if (!isValidOperation) {
                return res.status(400).json({ error: 'Invalid updates!' });
            }

            updates.forEach(update => user[update] = req.body[update]);
            await user.save();
        }

        const updatedUser = await User.findById(user.id)
            .select('-passwordHash')
            .populate('friends.userId', 'username avatarUrl');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    registerUser,
    loginUser,
    updateUser,
    deleteUser
};
const User = require('../models/User');
const Session = require('../models/Session');
const Group = require('../models/Group');
const BlacklistToken = require('../models/BlacklistToken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET
    return jwt.sign(
        { id: user._id },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )
}

const invalidateToken = async (token) => {
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    await BlacklistToken.create({ token, expiresAt });
};

const refreshToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Authorization required | ERRC: 010' });

        // Verify and decode the old token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found | ERRC: 031' });

        // Invalidate the old token
        await invalidateToken(token);

        // Generate new token
        const newToken = generateToken(user);

        res.status(200).json({ token: newToken });
    } catch (err) {
        console.error(err.message);
        const errorMessage = err.name === 'TokenExpiredError'
            ? 'Login again | ERRC: 032'
            : 'Invalid token | ERRC: 033';
        res.status(401).json({ error: errorMessage });
    }
};

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
        console.error(`${err.message} reg err`);
        res.status(500).json({ error: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user;
        if (username) {
            user = await User.findOne({ username });
            if (!user) return res.status(401).json({ error: 'Username or password does not match | ERRC: 200' });
            login("Username")
        } else if (email) {
            user = await User.findOne({ email });
            if (!user) return res.status(401).json({ error: 'Email or password does not match | ERRC: 210' });
            login("Email")
        } else {
            return res.status(401).json({ error: "Please provide an email or username | ERRC: 220" })
        }
        async function login(method) {
            if (!password) return res.status(401).json({ error: "Please provide the password | ERRC: 230" })
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatch) return res.status(401).json({ error: `${method} or password does not match | ERRC: 240` });
            token = generateToken(user);
            res.status(200).json({ token })
        }
    } catch (err) {
        console.error(`${err.message} login error.`);
        res.status(500).json({ error: 'Login failed' });
    }
}

const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Not authorized | ERRC: 010' });

        await invalidateToken(token);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
}

const getMyInfo = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
            .select('-passwordHash')
            .populate('friends.userId', 'username avatarUrl');
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const getMySessions = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        let sessions = await Session.find({ hostId: user._id });
        sessions.push(...await Session.find({ 'participants.user': user._id }));
        res.status(200).json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const getMyGroups = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        let groups = await Group.find({ ownerId: user._id });
        groups.push(...await Group.find({ 'members.memberId': user._id }));
        res.status(200).json(groups);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const getMyFriends = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
            .populate('friends.userId', 'username avatarUrl');
        res.status(200).json(user.friends);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
}

const getMyGames = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id)
            .populate('games.gameId', 'name description publisher releaseYear');
        res.status(200).json(user.games);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
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

const updateAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const defaultAvatar = "/avatars/default.png";
        if (user.avatarUrl && user.avatarUrl !== defaultAvatar) {
            const filename = user.avatarUrl.split('/').pop();
            const filePath = path.join(__dirname, '..', 'uploads', 'avatars', filename);

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        user.avatarUrl = `${baseUrl}/avatars/${req.file.filename}`;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({
            error: error.message || 'Avatar update failed',
            details: error.stack
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (req.body.friendAction) {
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
                    await user.removeFriend();
                    await addedFriend.removeFriend();
                    break;
                case 'update-status':
                    const friend = user.friends.find(friend => friend.userId.equals(friendId));

                    const addUser = addedFriend.friends.find(friend => friend.userId.equals(req.params.id))

                    if (!friend) return res.status(404).json({ error: 'Friend not found' });
                    if (!friendActions.includes(status)) return res.status(400).json({ error: 'Invalid status' });

                    if (status == "rejected") {
                        await user.removeFriend();
                        await addedFriend.removeFriend();
                    } else {
                        friend.status = status;
                        addUser.status = status;
                        await user.statusUpdate();
                        await addedFriend.statusUpdate();
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
                    if (user.games.some(g => g.gameId.equals(gameObjectId)))
                        return res.status(400).json({ error: 'Game already in collection' });
                    await user.editUserGames(gameObjectId, "add");
                    break;

                case "remove":
                    if (!user.games.some(g => g.gameId.equals(gameObjectId)))
                        return res.status(400).json({ error: 'Game not in collection' });
                    await user.editUserGames(gameObjectId, "remove");
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid game action' });
            }
        } else if (req.body.sessionAction) {
            const { sessionId, action } = req.body.sessionAction;
            if (!mongoose.Types.ObjectId.isValid(sessionId))
                return res.status(400).json({ error: 'Invalid session ID' });
            switch (action) {
                case "add":
                    await user.addSession(sessionId);
                    break;
                case "remove":
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

            if (!isValidOperation) return res.status(400).json({ error: 'Invalid updates!' });

            updates.forEach(update => user[update] = req.body[update]);
            await user.save();
        }

        const updatedUser = await User.findById(user.id)
            .select('-passwordHash')
            .populate('friends.userId', 'username avatarUrl');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error.message);

        if (error.name === 'CastError')
            return res.status(400).json({ error: 'Invalid user ID format' });

        if (error.name === 'ValidationError')
            return res.status(400).json({ error: error.message });

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let stats = {
            hostSessionsDeleted: 0,
            ownerGroupsDeleted: 0,
            participantGroupsCleaned: 0,
            participantSessionsCleaned: 0,
            usersUpdated: 0
        };
        const hostSessions = await Session.find({ hostId: user._id });
        const groupsOwned = await Group.find({ ownerId: user._id })
        if (hostSessions.length > 0) {
            const sessionIds = hostSessions.map(session => session._id);

            const allParticipants = [...new Set(
                hostSessions.flatMap(session =>
                    session.participants.map(p => p.user)
                )
            )];

            const userUpdateResult = await User.updateMany(
                { _id: { $in: allParticipants } },
                { $pull: { sessions: { sessionId: { $in: sessionIds } } } }
            );
            stats.usersUpdated += userUpdateResult.modifiedCount;

            // Delete host sessions
            const deleteResult = await Session.deleteMany({ _id: { $in: sessionIds } });
            stats.hostSessionsDeleted += deleteResult.deletedCount;
        }

        if (groupsOwned.length > 0) {
            const groupsIds = groupsOwned.map(group => group._id);
            const allMembers = [...new Set(
                groupsOwned.flatMap(group => group.members.map(m => m.memberId))
            )];

            const userGroupUpdateResult = await User.updateMany(
                { _id: { $in: allMembers } },
                { $pull: { groups: { groupId: { $in: groupsIds } } } }
            );
            stats.usersUpdated += userGroupUpdateResult.modifiedCount;

            const deleteGroupResult = await Group.deleteMany({ _id: { $in: groupsIds } });
            stats.ownerGroupsDeleted += deleteGroupResult.deletedCount;
        }

        // Handle user as participant in other sessions
        const sessionUpdateResult = await Session.updateMany(
            { 'participants.user': user._id },
            { $pull: { participants: { user: user._id } } }
        );
        stats.participantSessionsCleaned += sessionUpdateResult.modifiedCount;
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: 'User deleted successfully',
            data: stats
        });

    } catch (error) {
        console.error('Deletion error:', error);
        res.status(error.name === 'CastError' ? 400 : 500).json({
            error: error.name === 'CastError'
                ? 'Invalid user ID format'
                : 'Server error'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    getMyInfo,
    getMySessions,
    getMyGroups,
    getMyFriends,
    getMyGames,
    registerUser,
    refreshToken,
    loginUser,
    logoutUser,
    updateAvatar,
    updateUser,
    deleteUser
};
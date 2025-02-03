const User = require('../models/User')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator');

const generateToken = (user) => {
    return jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
    )
}

const registerUser = async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const { username, email, password} = req.body;

        const existingUser = await User.findOne({$or: [{username}, {email}]})
        if (existingUser){
            return res.status(400).json({
                error: existingUser.username === username ? 'Username already exists' : 'Email already registered'
            })
        }

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
    } catch(err){
        console.log(`${err.message} reg err`);
        res.status(500).json({error: 'Server error'});
        
    }
};

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
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        res.status(500).json({ error: 'Server error' });
    }
};

// const updateUser = async (req, res) => {
//     try {
//         const user = await User.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         );
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

        

//         const updates = Object.keys(req.body);
//         const allowedUpdates = ['username', 'email', 'password'];
//         const isValidOperation = updates.every(update => 
//             allowedUpdates.includes(update)
//         );

//         if (!isValidOperation) 
//             return res.status(400).send({ error: 'Invalid updates!' });
        
//         if (!user) 
//             return res.status(404).send();
//         res.send(user);
//     } catch (error) {
//         console.error(error.message);
//         if (error.name === 'CastError') 
//             return res.status(400).json({ error: 'Invalid user ID format' });
//         if (error.name === 'ValidationError') 
//             return res.status(400).json({ error: error.message });
//         res.status(500).json({ error: 'Server error' });
//     }
// };

const updateUser = async (req, res) => {
    const friendActions = ['pending', 'accepted', 'rejected']
    try {
        const user = await User.findById(req.params.id);
        if (!user) 
            return res.status(404).json({ error: 'User not found' });

        if (req.body.friendAction) {
            const { action, friendId, status } = req.body.friendAction;
            
            if (!mongoose.Types.ObjectId.isValid(friendId)) 
                return res.status(400).json({ error: 'Invalid friend ID format' });
            

            const addedFriend = await User.findById(friendId);
            switch(action) {
                case 'add':
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
                    
                    
                    if (!friend) {
                        return res.status(404).json({ error: 'Friend not found' });
                    }
                    if (!friendActions.includes(status)) {
                        return res.status(400).json({ error: 'Invalid status' });
                    }
                    friend.status = status;
                    addUser.status = status;
                    await user.save();
                    await addUser.save();
                    console.log(friend);
                    console.log(addUser);
                    break;
                    
                default:
                    return res.status(400).json({ error: 'Invalid friend action' });
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
            .select('-passwordHash') // Exclude password hash
            .populate('friends.userId', 'username avatarUrl'); // Populate friend details

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
    registerUser,
    updateUser,
    deleteUser
};
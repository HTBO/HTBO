const User = require('../models/User')
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
            username, email, passwordHash, avatarUrl: req.body.avatarUrl || undefined
        });

        const token = generateToken(newUser)

    } catch(err){
        console.log(`${err.message} reg err`);
        res.status(500).json({error: 'Server error'})
        
    }
}

exports.getUsers = async(req, res) => {

}
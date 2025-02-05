const mongoose = require('mongoose');
const Session = require('../models/Session')


const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
}, {_id: false});

const gamesSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    status: {
        type: String,
        enum: ['add', 'remove']
    }
},{_id: false});

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
}, {_id: false});


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 15,
        match: /^[a-zA-Z0-9_]+$/ //Letters numbers and underscores only
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ //Email validation
    },
    passwordHash: {
        type: String,
        required: [true, 'Please provide a password']
    },
    avatarUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"
    },
    friends: [friendSchema],
    games: [gamesSchema],
    sessions: [sessionSchema],
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret){
            delete ret.passwordHash; //Password excluding from response
            return ret;
        }
    }
});

userSchema.virtual('profileUrl').get(function() {
    return `/users/${this.username}`;
});



userSchema.methods.addFriend = function(userId){
    if(!this.friends.some(f =>f.userId.equals(userId))){
        this.friends.push({userId, status: 'pending'})
    }
    return this.save();
};

userSchema.methods.removeFriend = function(userId){
    if (!this.friends.some(f => f.userId.equals(userId))) {
        this.friends.splice(userId, 1);
    }
    return this.save();
}

userSchema.methods.statusUpdate = function(userId, status){
    this.friends.some(f => f.userId.equals(userId)).status = status;
    return this.save();
}

userSchema.methods.addGame = function(gameId, status){
    if(!this.games.some(g => g.gameId.equals(gameId))){
        this.games.push({gameId, status: status})
    }
    return this.save()
}

userSchema.methods.removeGame = function(gameId){
    if(!this.games.some(g => g.gameId.equals(gameId))){
        this.games.splice(gameId, 1);
    }
    return this.save();
}

userSchema.methods.addSession = function (sessionId) {
    if (!this.sessions.some(s => s.hostId.equals(sessionId))) {
        this.sessions.push({hostId: sessionId, status: "pending"})        
    }
    return this.save();
}

userSchema.methods.removeSession = function(sessionId){
    if(this.sessions.some(s => s.hostId.equals(sessionId))){
        console.log(this.sessions);
        
        this.sessions.splice({hostId: sessionId}, 1);
    }
    return this.save();
}

const User = mongoose.model('User', userSchema)

module.exports = User;
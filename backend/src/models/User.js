const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    friendStatus: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    },
}, { _id: false });

const gamesSchema = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    sessionStatus: {
        type: String,
        enum: ['pending', 'accepted', 'host'],
        default: 'pending'
    },
}, {_id: false});

const groupSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    groupStatus: {
        type: String,
        enum: ['pending', 'accepted', 'owner'],
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
    groups: [groupSchema],
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
        transform: function (doc, ret) {
            delete ret.passwordHash; //Password excluding from response
            return ret;
        }
    }
});

userSchema.virtual('profileUrl').get(function () {
    return `/users/${this.username}`;
});



userSchema.methods.addFriend = function (userId) {
    if (!this.friends.some(f => f.userId.equals(userId))) {
        this.friends.push({ userId, friendStatus: 'pending' })
    }
    return this.save();
};

userSchema.methods.removeFriend = function (userId) {
    if (!this.friends.some(f => f.userId.equals(userId))) {
        this.friends.splice(userId, 1);
    }
    return this.save();
}

userSchema.methods.statusUpdate = function (userId, status) {
    this.friends.some(f => f.userId.equals(userId)).friendStatus = status;
    return this.save();
}

userSchema.methods.editUserGames = function (gameId, status) {
    if (status == "add") {
        if (!this.games.some(g => g.gameId.equals(gameId)))
            this.games.push({gameId})
    } else if (status == "remove") 
        this.games.splice(gameId, 1);
    
    return this.save()
}

userSchema.methods.addGroup = function (groupId) {
    if (!this.groups.some(g => g.groupId.equals(groupId))) {
        this.groups.push({groupId, groupStatus: "pending"})
    }
    return this.save();
}

userSchema.methods.removeGroup = function (groupId) {
    if (!this.groups.some(g => g.groupId.equals(groupId))) {
        this.groups.splice(groupId, 1);
    }
    return this.save();
}

userSchema.methods.updateGroupStatus = function (groupId, status) {
    console.log(groupId, status);
    console.log(this.groups.some(g => g.groupId.equals(groupId)));
    
    this.groups.some(g => g.groupId.equals(groupId)).groupStatus = status;
    return this.save();
}

userSchema.methods.addSession = function (sessionId) {
    if (!this.sessions.some(s => s.hostId.equals(sessionId))) {
        this.sessions.push({sessionId: sessionId, sessionStatus: "pending"})        
    }
    return this.save();
}

userSchema.methods.removeSession = function(sessionId){
    if(this.sessions.some(s => s.sessionId.equals(sessionId))){
        this.sessions.splice({sessionId: sessionId}, 1);
    }
    return this.save();
}

const User = mongoose.model('User', userSchema)

module.exports = User;
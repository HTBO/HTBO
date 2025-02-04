const mongoose = require('mongoose');

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
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fmusic.apple.com%2Fgb%2Fartist%2Fnigger-killer%2F1441569506&psig=AOvVaw2ayi4c1XZwl9951BFj8MGe&ust=1738660171095000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOCEh4GUp4sDFQAAAAAdAAAAABAE"
    },
    friends: [friendSchema],
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    }],
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

const User = mongoose.model('User', userSchema)

module.exports = User;
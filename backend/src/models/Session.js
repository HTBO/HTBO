const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a host ID'],
        unique: true,
        trim: true,
    },
    gameId: {
        type: mongoose.Types.ObjectId,
        ref: 'Game',
        required: [true, 'Please provide an game'],
        unique: true,
        trim: true,
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please provide a date']
    },
    description: {
        type: String,
        default: "Not described"
    },
    participants: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide participants'],
        unique: true,
        trim: true
    }],
    // groups: [gamesSchema],
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

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session;
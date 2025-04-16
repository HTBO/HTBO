const mongoose = require('mongoose');


const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'host'],
        default: 'pending'
    }
  }, {_id: false})

const sessionSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a host ID']
    },
    gameId: {
        type: Number,
        required: [true, 'Please provide an game']
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please provide a date']
    },
    description: {
        type: String,
        default: "Not described"
    },
    participants: [participantSchema],
    groups: {
      type: mongoose.Types.ObjectId,
      ref: 'Group'
    },
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
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

sessionSchema.methods.addParticipant = function(userId){
    if(!this.participants.some(p => p.user.equals(userId)))
        this.participants.push({user: userId, status: 'pending'})
    return this.save();
}

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session;
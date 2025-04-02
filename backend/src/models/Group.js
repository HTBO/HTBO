const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'owner'],
        default: 'pending'
    }
}, { _id: false })

const groupSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide an owner ID']
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    members: {
        type: [memberSchema]
    },
    createdAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Group', groupSchema);
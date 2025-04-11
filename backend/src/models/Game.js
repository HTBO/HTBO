const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  publisher: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  releaseYear: {
    type: Number,
    required: true,
    maxlength: 4
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

gameSchema.virtual('shortDescription').get(function () {
  return this.description.substring(0, 50) + '...';
});

module.exports = mongoose.model('Game', gameSchema);
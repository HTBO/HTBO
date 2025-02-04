// src/models/Store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A bolt neve kötelező'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  address: {
    type: String,
    required: [true, 'A cím kötelező'],
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Érvénytelen URL formátum']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
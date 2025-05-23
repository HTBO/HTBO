const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  invalidatedAt: { type: Date, default: Date.now },
});

// Auto-delete documents after `expiresAt`
blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('blacklistToken', blacklistTokenSchema);
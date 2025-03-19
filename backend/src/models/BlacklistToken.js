const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
});

// Auto-delete documents after `expiresAt`
blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BlacklistToken', blacklistTokenSchema);
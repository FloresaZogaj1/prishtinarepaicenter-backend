const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'reception'], default: 'admin' },
  // store active refresh tokens for the user (rotate or revoke as needed)
  refreshTokens: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

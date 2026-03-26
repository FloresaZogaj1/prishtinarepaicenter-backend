const crypto = require('crypto');

// Use a deterministic fast hash (SHA-256) for refresh token storage.
// We purposely avoid bcrypt here because hashing/verification needs to be fast
// and deterministic across processes; SHA-256 is sufficient when combined
// with strong random tokens (JWTs) and short rotation windows.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Add a hashed token to user.refreshTokens and enforce a max limit (default 5)
async function addRefreshTokenToUser(user, token, maxTokens = 5) {
  const hashed = hashToken(token);
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(hashed);
  // keep only the most recent maxTokens entries
  if (user.refreshTokens.length > maxTokens) {
    user.refreshTokens = user.refreshTokens.slice(-maxTokens);
  }
  await user.save();
}

// Remove a refresh token (by raw token value) from user.refreshTokens
async function removeRefreshTokenFromUser(user, token) {
  const hashed = hashToken(token);
  user.refreshTokens = (user.refreshTokens || []).filter(t => t !== hashed);
  await user.save();
}

// Check whether a raw token exists in the user's stored (hashed) tokens
function userHasRefreshToken(user, token) {
  if (!user || !user.refreshTokens) return false;
  const hashed = hashToken(token);
  return user.refreshTokens.includes(hashed);
}

module.exports = {
  hashToken,
  addRefreshTokenToUser,
  removeRefreshTokenFromUser,
  userHasRefreshToken
};

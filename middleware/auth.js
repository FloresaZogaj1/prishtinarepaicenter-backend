const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
  // Support both x-auth-token and Authorization: Bearer <token>
  let token = req.header('x-auth-token') || null;
  const authHeader = req.header('authorization') || req.header('Authorization');
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'No token, authorization denied', error: 'No token' });

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment. Authentication cannot proceed.');
    return res.status(500).json({ message: 'Server misconfiguration: JWT secret not set', error: 'JWT_SECRET missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Mask token in logs to avoid exposing secrets
    try {
      const preview = typeof token === 'string' ? `${token.slice(0,6)}...${token.slice(-6)}` : String(token);
      console.error(`JWT verification failed for token (preview: ${preview}) - ${err && err.name ? err.name : 'Error'}:`, err && err.message ? err.message : err);
    } catch (logErr) {
      console.error('JWT verification failed and token previewing failed:', logErr);
    }
    // Don't leak internal error messages to the client. Provide clear, actionable responses.
    if (err && err.name === 'TokenExpiredError') {
      // err.expiredAt is a Date object provided by jsonwebtoken
      return res.status(401).json({ message: 'Token expired', error: 'token_expired', expiredAt: err.expiredAt ? err.expiredAt.toISOString() : undefined });
    }

    if (err && err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', error: 'invalid_token' });
    }

    return res.status(401).json({ message: 'Token is not valid', error: 'token_invalid' });
  }
};

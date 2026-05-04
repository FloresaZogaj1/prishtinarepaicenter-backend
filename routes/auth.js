const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  addRefreshTokenToUser,
  removeRefreshTokenFromUser,
  userHasRefreshToken
} = require('../utils/tokenUtils');

const router = express.Router();

// Small helper to avoid indefinitely hanging promises (e.g. when DB is unreachable)
function withTimeout(promise, ms = 5000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Operation timed out')), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/**
 * LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    console.log('LOGIN HIT:', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username & password required' });
    }

    // Guard: ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    // Look up user with a timeout to avoid hanging when DB is unreachable
    const user = await withTimeout(User.findOne({ username }).exec(), 5000);
    if (!user) {
      // Avoid leaking whether username exists — same message for both cases
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password with timeout as bcrypt may take time
    const isMatch = await withTimeout(bcrypt.compare(password, user.password), 5000);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create tokens (synchronously fast)
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    const maxStored = parseInt(process.env.MAX_STORED_REFRESH_TOKENS || '5', 10);
    // Persist refresh token with timeout to avoid indefinite waits
    await withTimeout(addRefreshTokenToUser(user, refreshToken, maxStored), 5000);

    // Configure cookie options. Only set domain if explicitly provided in env.
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    if (process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.json({ accessToken });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    // Differentiate timeout vs other errors
    if (err && err.message && err.message.includes('timed out')) {
      return res.status(503).json({ message: 'Database timeout, try again later' });
    }
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

/**
 * REFRESH
 */
router.post('/refresh', async (req, res) => {
  try {
    let { refreshToken } = req.body || {};
    if (!refreshToken && req.cookies) {
      refreshToken = req.cookies.refreshToken;
    }

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token missing' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    if (!userHasRefreshToken(user, refreshToken)) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    await removeRefreshTokenFromUser(user, refreshToken);
    await addRefreshTokenToUser(user, newRefreshToken, 5);

    const cookieOptions2 = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    if (process.env.COOKIE_DOMAIN) cookieOptions2.domain = process.env.COOKIE_DOMAIN;
    res.cookie('refreshToken', newRefreshToken, cookieOptions2);

    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('REFRESH ERROR:', err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

/**
 * GET /me - return basic user info for the currently authenticated access token
 * This endpoint reads the Authorization: Bearer <token> header, verifies it
 * and returns minimal user data (id, username, role) so frontend can populate
 * AuthProvider without relying on token-only heuristics.
 */
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers && req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(404).json({ message: 'Not found' });
    const token = auth.slice(7).trim();
    if (!token) return res.status(404).json({ message: 'Not found' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (!payload || !payload.id) return res.status(401).json({ message: 'Invalid token' });
    const user = await User.findById(payload.id).select('username role').lean();
    if (!user) return res.status(401).json({ message: 'User not found' });
    return res.json({ id: user._id, username: user.username, role: user.role || 'admin' });
  } catch (err) {
    console.error('ME ERROR:', err);
    return res.status(500).json({ message: 'Failed to load user' });
  }
});

/**
 * LOGOUT
 */
router.post('/logout', async (req, res) => {
  try {
    let { refreshToken } = req.body || {};
    if (!refreshToken && req.cookies) {
      refreshToken = req.cookies.refreshToken;
    }

    if (refreshToken) {
      const payload = jwt.decode(refreshToken);
      if (payload?.id) {
        const user = await User.findById(payload.id);
        if (user) {
          await removeRefreshTokenFromUser(user, refreshToken);
        }
      }
    }

    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });

  } catch (err) {
    console.error('LOGOUT ERROR:', err);
    res.clearCookie('refreshToken');
    return res.status(400).json({ message: 'Logout failed' });
  }
});

module.exports = router;
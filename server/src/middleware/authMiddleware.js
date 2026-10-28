import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes by validating JWT from cookie or Authorization header.
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Reject if no token
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this resource. Please log in.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'nextowner_default_jwt_secret_dev';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification failed:', error.message);
    return res.status(401).json({
      status: 'error',
      code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authorization token.'
    });
  }
};

/**
 * Helper to generate token, set secure cookie, and respond with user data.
 */
export const sendTokenResponse = (user, statusCode, res, message = null, extraData = {}) => {
  const token = user.getSignedJwtToken();
  const days = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);
  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      campus: user.campus,
      studentId: user.studentId,
      phone: user.phone,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    },
    ...extraData
  });
};

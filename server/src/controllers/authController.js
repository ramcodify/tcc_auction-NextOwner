import crypto from 'crypto';
import User from '../models/User.js';
import { sendTokenResponse } from '../middleware/authMiddleware.js';
import { sendEmail } from '../utils/sendEmail.js';

/**
 * Register a new student account.
 * Business Rule: Single student account system. No buyer/seller role selection.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, campus, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide full name, campus email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    // Check if external SMTP email service is configured
    const isSmtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    // Create user instance
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      campus: campus?.trim() || 'Main Campus',
      studentId: studentId?.trim() || '',
      isVerified: !isSmtpConfigured // If SMTP is not configured, automatically verify so the student can use the platform
    });

    let verificationToken = null;
    if (isSmtpConfigured) {
      verificationToken = user.getEmailVerificationToken();
    }

    await user.save();

    if (isSmtpConfigured && verificationToken) {
      const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your NEXTowner Campus Account',
        text: `Welcome to NEXTowner! Please verify your student account by clicking: ${verifyUrl}`,
        html: `<p>Welcome to NEXTowner!</p><p>Please verify your student account by clicking below:</p><a href="${verifyUrl}">Verify My Account</a>`
      });
    }

    return sendTokenResponse(
      user,
      201,
      res,
      'Registration successful. Welcome to NEXTowner!'
    );
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during registration.'
    });
  }
};

/**
 * Log in student account and set httpOnly cookie.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    return sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during login.'
    });
  }
};

/**
 * Log out student and clear session cookie.
 */
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
};

/**
 * Get current authenticated user profile.
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      campus: req.user.campus,
      studentId: req.user.studentId,
      phone: req.user.phone,
      bio: req.user.bio,
      isVerified: req.user.isVerified,
      createdAt: req.user.createdAt
    }
  });
};

/**
 * Update student profile.
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, campus, studentId, phone, bio } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (campus !== undefined) user.campus = campus.trim();
    if (studentId !== undefined) user.studentId = studentId.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
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
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile.'
    });
  }
};

/**
 * Change password for authenticated student.
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    return sendTokenResponse(user, 200, res, 'Password changed successfully.');
  } catch (error) {
    console.error('[Change Password Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to change password.'
    });
  }
};

/**
 * Request password reset token.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide your account email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return neutral message to prevent email harvesting
      return res.status(200).json({
        status: 'success',
        message: 'If a matching account was found, a password reset link has been dispatched.'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const isSmtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request — NEXTowner',
      text: `You requested a password reset. Please use the following link to reset your password (valid for 15 minutes): ${resetUrl}`,
      html: `<p>You requested a password reset for NEXTowner.</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link expires in 15 minutes.</p>`
    });

    return res.status(200).json({
      status: 'success',
      message: 'If a matching account was found, a password reset link has been dispatched.',
      // Provide simulation URL in local development if SMTP is not configured
      ...(isSmtpConfigured ? {} : { devResetUrl: resetUrl, resetToken })
    });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset request.'
    });
  }
};

/**
 * Reset password using token.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Hash URL token to match database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired password reset token.'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res, 'Password has been reset successfully. You are now logged in.');
  } catch (error) {
    console.error('[Reset Password Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to reset password.'
    });
  }
};

/**
 * Verify email token.
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const verificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired email verification token.'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Campus email verified successfully.'
    });
  } catch (error) {
    console.error('[Verify Email Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to verify email.'
    });
  }
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

// @desc    Register new customer user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, company, phone, country } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Username, Email, and Password are required'
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: email.toLowerCase().trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or Email is already registered'
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      company: company || '',
      phone: phone || '',
      country: country || '',
      role: 'user' // Default to normal customer role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'supersecretjwtkeyforadminpanel123!',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        company: user.company,
        phone: user.phone,
        country: user.country,
        role: user.role,
        token: token
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create user account'
    });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Please provide username and password' 
    });
  }

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username.toLowerCase() }
      ]
    });

    if (user && (await user.matchPassword(password))) {
      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'supersecretjwtkeyforadminpanel123!',
        { expiresIn: '30d' }
      );

      return res.json({
        status: 'success',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          company: user.company || '',
          phone: user.phone || '',
          country: user.country || '',
          role: user.role || 'user',
          token: token
        }
      });
    } else {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid username or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

// @desc    Forgot Password - Send reset link to user email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide an email address'
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        status: 'success',
        message: 'If that email address is registered, a password reset link has been sent.'
      });
    }

    // Get reset token from user method
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your account. Please click the link below to reset your password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Note: This link is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: message
    });

    if (!result.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: 'error',
        message: 'Email could not be sent'
      });
    }

    return res.json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
router.post('/reset-password/:resetToken', async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a password at least 6 characters long'
    });
  }

  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired password reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({
      status: 'success',
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;

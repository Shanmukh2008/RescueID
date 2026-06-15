const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store reset tokens temporarily in memory
const resetTokens = {};

// Request password reset
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Generate a 6 digit code
    const code = crypto.randomInt(100000, 999999).toString();
    resetTokens[email] = {
      code,
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    };

    // Send email
    await transporter.sendMail({
      from: `RescueID <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'RescueID Password Reset Code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #e53e3e;">RescueID Password Reset</h2>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 8px; color: #111;">${code}</h1>
          <p style="color: #666;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'Reset code sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Verify code and reset password
router.post('/reset', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const record = resetTokens[email];
    if (!record) {
      return res.status(400).json({ message: 'No reset request found for this email' });
    }
    if (record.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }
    if (Date.now() > record.expires) {
      delete resetTokens[email];
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { email } });

    delete resetTokens[email];
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;
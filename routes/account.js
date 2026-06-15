const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const auth = require('../middleware/auth');

const router = express.Router();

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: req.userId } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/delete', auth, async (req, res) => {
  try {
    await EmergencyContact.destroy({ where: { userId: req.userId } });
    await User.destroy({ where: { id: req.userId } });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
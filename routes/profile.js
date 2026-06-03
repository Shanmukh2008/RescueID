const express = require('express');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const auth = require('../middleware/auth');

const router = express.Router();

// Get own profile (private - requires login)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: EmergencyContact }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (private - requires login)
router.put('/me', auth, async (req, res) => {
  try {
    const {
      fullName, dateOfBirth, gender, bloodGroup,
      allergies, medications, medicalConditions,
      emergencyContacts
    } = req.body;

    // Update user
    await User.update({
      fullName, dateOfBirth, gender, bloodGroup,
      allergies, medications, medicalConditions
    }, { where: { id: req.userId } });

    // Update emergency contacts
    if (emergencyContacts && emergencyContacts.length > 0) {
      // Delete old contacts and replace with new ones
      await EmergencyContact.destroy({ where: { userId: req.userId } });
      const contacts = emergencyContacts.map(c => ({ ...c, userId: req.userId }));
      await EmergencyContact.bulkCreate(contacts);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get emergency profile (PUBLIC - no login needed, for paramedics)
router.get('/emergency/:emergencyAccessId', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { emergencyAccessId: req.params.emergencyAccessId },
      attributes: ['fullName', 'dateOfBirth', 'gender', 'bloodGroup', 'allergies', 'medications', 'medicalConditions'],
      include: [{ model: EmergencyContact }]
    });

    if (!user) {
      return res.status(404).json({ message: 'No profile found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
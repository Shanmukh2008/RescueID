const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rescueid',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  }
});

const upload = multer({ storage });

router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const photoUrl = req.file.path;
    await User.update({ photo: photoUrl }, { where: { id: req.userId } });
    res.json({ message: 'Photo uploaded successfully', photoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

module.exports = router;
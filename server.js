const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
require('./models/User');
require('./models/EmergencyContact');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://rescueid.netlify.app',
    'http://rescueid.tech',
    'https://rescueid.tech',
    'http://www.rescueid.tech',
    'https://www.rescueid.tech'
  ],
  credentials: true
}));;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reset', require('./routes/reset'));
app.use('/api/account', require('./routes/account'));
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'RescueID API is running' });
});

const PORT = process.env.PORT || 8000;

sequelize.authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('PostgreSQL connection error:', err));

module.exports = app;
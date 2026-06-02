const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (we'll add these soon)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/profile', require('./routes/profile'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'RescueID API is running' });
});

// Connect to MySQL and start server
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MySQL connection error:', err));

module.exports = app;
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const EmergencyContact = sequelize.define('EmergencyContact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// A user can have many emergency contacts
User.hasMany(EmergencyContact, { foreignKey: 'userId', onDelete: 'CASCADE' });
EmergencyContact.belongsTo(User, { foreignKey: 'userId' });

module.exports = EmergencyContact;
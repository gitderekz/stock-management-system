const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  systemName: {
    type: DataTypes.STRING(160),
    allowNull: false,
    defaultValue: 'Stock Management System',
  },
  logoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  defaultColor: {
    type: DataTypes.STRING(40),
    allowNull: true,
    defaultValue: '#2d6cdf',
  },
  smtpHostname: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  smtpEmail: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  smtpPort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 465,
  },
  locale: {
    type: DataTypes.STRING(40),
    allowNull: true,
    defaultValue: 'en',
  },
}, {
  tableName: 'settings',
  timestamps: true,
});

module.exports = Settings;

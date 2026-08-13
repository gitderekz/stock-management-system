const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('warehouse', 'store', 'branch', 'site'),
    allowNull: false,
    defaultValue: 'warehouse',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'locations',
  timestamps: true,
});

module.exports = Location;

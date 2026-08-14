const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tax = sequelize.define('Tax', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('VAT', 'WITHHOLDING', 'OTHER'),
    defaultValue: 'OTHER',
  },
  applicable_to: {
    type: DataTypes.JSON,
    defaultValue: ['all'],
  },
  is_inclusive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_recoverable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'taxes',
  timestamps: true,
  underscored: true,
});

module.exports = Tax;

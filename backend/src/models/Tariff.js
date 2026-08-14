const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tariff = sequelize.define('Tariff', {
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
  calculation_method: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'PER_UNIT'),
    defaultValue: 'PERCENTAGE',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'tariffs',
  timestamps: true,
  underscored: true,
});

module.exports = Tariff;

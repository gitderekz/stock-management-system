const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DamagedStock = sequelize.define('DamagedStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productId',
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'locationId',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reportedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reportedBy',
  },
}, {
  tableName: 'damaged_stock',
  timestamps: true,
  underscored: false,
});

module.exports = DamagedStock;

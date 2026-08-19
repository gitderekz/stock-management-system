const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockReturnItem = sequelize.define('StockReturnItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stock_return_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  batch_no: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  unit_selling_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'stock_return_items',
  timestamps: true,
  underscored: true,
});

module.exports = StockReturnItem;

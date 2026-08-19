const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockDamagedItem = sequelize.define('StockDamagedItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  damaged_stock_id: {
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
  tableName: 'stock_damaged_items',
  timestamps: true,
  underscored: true,
});

module.exports = StockDamagedItem;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockBatch = sequelize.define('StockBatch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  batch_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quantity_received: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quantity_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  unit_selling_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  landed_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  received_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  condition: {
    type: DataTypes.ENUM('new', 'used', 'refurbished', 'damaged'),
    defaultValue: 'new',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'stock_batches',
  timestamps: true,
  underscored: true,
});

module.exports = StockBatch;

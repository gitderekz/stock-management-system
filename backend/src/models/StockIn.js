const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockIn = sequelize.define('StockIn', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reference_no: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  invoice_no: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receipt_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'RECEIVED', 'PARTIAL', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
}, {
  tableName: 'stock_in',
  timestamps: true,
  underscored: true,
});

module.exports = StockIn;

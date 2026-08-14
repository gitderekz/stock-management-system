const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  po_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  po_status: {
    type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'DRAFT',
  },
  payment_status: {
    type: DataTypes.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'),
    defaultValue: 'UNPAID',
  },
  delivery_status: {
    type: DataTypes.ENUM('PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  total_amount: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  total_paid: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expected_delivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actual_delivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'purchase_orders',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseOrder;

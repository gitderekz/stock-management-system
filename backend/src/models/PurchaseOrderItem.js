const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  unit_selling_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  shipping_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tariff_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  tax_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  landed_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'unit_cost + shipping_per_unit + tariff_per_unit + tax_per_unit',
  },
  total_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    comment: 'quantity * unit_cost',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'purchase_order_items',
  timestamps: true,
  underscored: true,
});

module.exports = PurchaseOrderItem;

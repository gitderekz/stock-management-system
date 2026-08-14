const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('purchase', 'sale', 'damage', 'adjustment', 'transfer', 'return', 'in', 'out'),
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: { model: 'products', key: 'id' },
    allowNull: true,
  },
  from_location_id: {
    type: DataTypes.INTEGER,
    references: { model: 'locations', key: 'id' },
    allowNull: true,
  },
  to_location_id: {
    type: DataTypes.INTEGER,
    references: { model: 'locations', key: 'id' },
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  total_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    defaultValue: 0,
  },
  purpose: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reference: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  issued_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
    allowNull: true,
  },
  batch_allocations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  referenceNo: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'stock_movements',
  timestamps: true,
});

module.exports = StockMovement;

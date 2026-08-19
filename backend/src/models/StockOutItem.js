const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockOutItem = sequelize.define('StockOutItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stockOutId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'stockOutId',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productId',
  },
  batchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'batchId',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0,
  },
  serialNumber: {
    type: DataTypes.STRING(160),
    allowNull: true,
    field: 'serialNumber',
  },
}, {
  tableName: 'stock_out_items',
  timestamps: true,
  underscored: false,
});

module.exports = StockOutItem;

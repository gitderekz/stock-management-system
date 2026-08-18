const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockTransferItem = sequelize.define('StockTransferItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stockTransferId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'stockTransferId',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'productId',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'stock_transfer_items',
  timestamps: true,
  underscored: false,
});

module.exports = StockTransferItem;

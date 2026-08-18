const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockInItem = sequelize.define('StockInItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  stock_in_id: {
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
    defaultValue: 0,
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
  },
  condition: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  batch_no: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  warranty_information: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'stock_in_items',
  timestamps: true,
  underscored: true,
});

module.exports = StockInItem;

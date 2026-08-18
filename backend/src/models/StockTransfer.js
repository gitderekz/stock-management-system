const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockTransfer = sequelize.define('StockTransfer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  referenceNo: {
    type: DataTypes.STRING(160),
    allowNull: false,
    field: 'referenceNo',
  },
  sourceLocationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sourceLocationId',
  },
  destinationLocationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'destinationLocationId',
  },
  requestedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'requestedBy',
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approvedBy',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'stock_transfers',
  timestamps: true,
  underscored: false,
});

module.exports = StockTransfer;

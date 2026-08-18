const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockOut = sequelize.define('StockOut', {
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
  recipient: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  engineerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'engineerId',
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'projectId',
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'locationId',
  },
  destination: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING(160),
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'userId',
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'issuedAt',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'ISSUED', 'PARTIAL', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
}, {
  tableName: 'stock_out',
  timestamps: true,
  underscored: false,
});

module.exports = StockOut;

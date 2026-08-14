const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  condition: {
    type: DataTypes.ENUM('new', 'used', 'damaged', 'reserved', 'obsolete'),
    allowNull: false,
    defaultValue: 'new',
  },
  model: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  version: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  serialCode: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    allowNull: false,
    defaultValue: 'active',
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  attachmentUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;

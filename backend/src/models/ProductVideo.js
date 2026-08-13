const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVideo = sequelize.define('ProductVideo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
}, {
  tableName: 'product_videos',
  timestamps: true,
});

module.exports = ProductVideo;

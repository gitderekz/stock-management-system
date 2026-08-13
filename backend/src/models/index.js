const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Product = require('./Product');
const Brand = require('./Brand');
const Category = require('./Category');
const Supplier = require('./Supplier');
const Warehouse = require('./Warehouse');
const StockMovement = require('./StockMovement');
const SystemLog = require('./SystemLog');
const Settings = require('./Settings');
const Location = require('./Location');
const StockBalance = require('./StockBalance');
const ProductImage = require('./ProductImage');
const ProductVideo = require('./ProductVideo');
const Attachment = require('./Attachment');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Notification = require('./Notification');

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });

Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

Warehouse.hasMany(Product, { foreignKey: 'warehouseId', as: 'products' });
Product.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(ProductVideo, { foreignKey: 'productId', as: 'videos' });
ProductVideo.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(StockBalance, { foreignKey: 'productId', as: 'balances' });
StockBalance.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Location.hasMany(StockBalance, { foreignKey: 'locationId', as: 'balances' });
StockBalance.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

Location.hasMany(StockMovement, { foreignKey: 'locationId', as: 'stockMovements' });
StockMovement.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

Product.belongsToMany(Location, { through: 'stock_balances', foreignKey: 'productId', otherKey: 'locationId' });
Location.belongsToMany(Product, { through: 'stock_balances', foreignKey: 'locationId', otherKey: 'productId' });

User.hasMany(StockMovement, { foreignKey: 'createdBy', as: 'stockMovements' });
StockMovement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(SystemLog, { foreignKey: 'userId', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

Role.hasMany(RolePermission, { foreignKey: 'roleId', as: 'access' });
Permission.hasMany(RolePermission, { foreignKey: 'permissionId', as: 'roleAssignments' });

module.exports = {
  sequelize,
  Role,
  User,
  Product,
  Brand,
  Category,
  Supplier,
  Warehouse,
  Location,
  StockBalance,
  ProductImage,
  ProductVideo,
  StockMovement,
  SystemLog,
  Settings,
  Notification,
  Attachment,
  Permission,
  RolePermission,
};

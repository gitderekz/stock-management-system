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
const StockBatch = require('./StockBatch');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const Tax = require('./Tax');
const Tariff = require('./Tariff');

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

Product.hasMany(StockMovement, { foreignKey: 'product_id', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(StockBalance, { foreignKey: 'productId', as: 'balances' });
StockBalance.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Location.hasMany(StockBalance, { foreignKey: 'locationId', as: 'balances' });
StockBalance.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// StockMovement has separate from/to location fields; expose both aliases used in controllers
StockMovement.belongsTo(Location, { foreignKey: 'from_location_id', as: 'from_location' });
StockMovement.belongsTo(Location, { foreignKey: 'to_location_id', as: 'to_location' });
Location.hasMany(StockMovement, { foreignKey: 'from_location_id', as: 'outgoingMovements' });
Location.hasMany(StockMovement, { foreignKey: 'to_location_id', as: 'incomingMovements' });

Product.belongsToMany(Location, { through: 'stock_balances', foreignKey: 'productId', otherKey: 'locationId' });
Location.belongsToMany(Product, { through: 'stock_balances', foreignKey: 'locationId', otherKey: 'productId' });

// StockMovement issued_by field maps to User (who performed the action)
User.hasMany(StockMovement, { foreignKey: 'issued_by', as: 'issuedMovements' });
StockMovement.belongsTo(User, { foreignKey: 'issued_by', as: 'issuer' });

User.hasMany(SystemLog, { foreignKey: 'userId', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

Role.hasMany(RolePermission, { foreignKey: 'roleId', as: 'access' });
Permission.hasMany(RolePermission, { foreignKey: 'permissionId', as: 'roleAssignments' });

// StockBatch <-> Product/Location/User
Product.hasMany(StockBatch, { foreignKey: 'product_id', as: 'batches' });
StockBatch.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Location.hasMany(StockBatch, { foreignKey: 'location_id', as: 'batches' });
StockBatch.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
User.hasMany(StockBatch, { foreignKey: 'received_by', as: 'batchesReceived' });
StockBatch.belongsTo(User, { foreignKey: 'received_by', as: 'receiver' });

// PurchaseOrder associations
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'purchaseOrdersCreated' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// PurchaseOrder <-> PurchaseOrderItem (line items on the PO)
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

// PurchaseOrderItem <-> Product
Product.hasMany(PurchaseOrderItem, { foreignKey: 'product_id', as: 'purchaseOrderItems' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Link PurchaseOrder <-> StockBatch (optional link for batches received against a PO)
PurchaseOrder.hasMany(StockBatch, { foreignKey: 'purchase_order_id', as: 'batches' });
StockBatch.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

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
  StockBatch,
  PurchaseOrder,
  PurchaseOrderItem,
  Tax,
  Tariff,
};

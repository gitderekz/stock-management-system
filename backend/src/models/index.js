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
const StockIn = require('./StockIn');
const StockInItem = require('./StockInItem');
const StockOut = require('./StockOut');
const StockOutItem = require('./StockOutItem');
const StockTransfer = require('./StockTransfer');
const StockTransferItem = require('./StockTransferItem');
const DamagedStock = require('./DamagedStock');
const StockReturn = require('./StockReturn');
const StockReturnItem = require('./StockReturnItem');
const StockDamagedItem = require('./StockDamagedItem');

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

// StockIn associations
StockIn.belongsTo(User, { foreignKey: 'user_id', as: 'receiver' });
User.hasMany(StockIn, { foreignKey: 'user_id', as: 'stockIns' });
StockIn.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Location.hasMany(StockIn, { foreignKey: 'location_id', as: 'stockIns' });
StockIn.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(StockIn, { foreignKey: 'supplier_id', as: 'stockIns' });
StockIn.hasMany(StockInItem, { foreignKey: 'stock_in_id', as: 'items' });
StockInItem.belongsTo(StockIn, { foreignKey: 'stock_in_id', as: 'stockIn' });
Product.hasMany(StockInItem, { foreignKey: 'product_id', as: 'receiptItems' });
StockInItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
PurchaseOrder.hasMany(StockIn, { foreignKey: 'purchase_order_id', as: 'goodsReceipts' });
StockIn.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

// Stock operation item relations
StockOutItem.belongsTo(StockBatch, { foreignKey: 'batchId', as: 'batch' });
StockReturnItem.belongsTo(StockBatch, { foreignKey: 'batchId', as: 'batch' });
StockDamagedItem.belongsTo(StockBatch, { foreignKey: 'batchId', as: 'batch' });

StockReturn.hasMany(StockReturnItem, { foreignKey: 'stock_return_id', as: 'items' });
StockReturnItem.belongsTo(StockReturn, { foreignKey: 'stock_return_id', as: 'stockReturn' });
DamagedStock.hasMany(StockDamagedItem, { foreignKey: 'damaged_stock_id', as: 'items' });
StockDamagedItem.belongsTo(DamagedStock, { foreignKey: 'damaged_stock_id', as: 'damagedStock' });

// Stock operation item -> operation associations
StockOut.hasMany(StockOutItem, { foreignKey: 'stockOutId', as: 'items' });
StockOutItem.belongsTo(StockOut, { foreignKey: 'stockOutId', as: 'stockOut' });
StockTransfer.hasMany(StockTransferItem, { foreignKey: 'stockTransferId', as: 'items' });
StockTransferItem.belongsTo(StockTransfer, { foreignKey: 'stockTransferId', as: 'stockTransfer' });

// Product -> DamagedStock and StockReturn associations
Product.hasMany(DamagedStock, { foreignKey: 'productId', as: 'damagedRecords' });
DamagedStock.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(StockReturn, { foreignKey: 'product_id', as: 'returns' });
StockReturn.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product associations with item tables (for includes in list/detail endpoints)
Product.hasMany(StockOutItem, { foreignKey: 'productId', as: 'outItems' });
StockOutItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(StockTransferItem, { foreignKey: 'productId', as: 'transferItems' });
StockTransferItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Location associations with operations
Location.hasMany(DamagedStock, { foreignKey: 'locationId', as: 'damagedItems' });
DamagedStock.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });
Location.hasMany(StockReturn, { foreignKey: 'location_id', as: 'returns' });
StockReturn.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// StockOut / StockTransfer / User associations required by page includes
StockOut.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });
Location.hasMany(StockOut, { foreignKey: 'locationId', as: 'stockOuts' });
StockOut.belongsTo(User, { foreignKey: 'userId', as: 'issuer' });
User.hasMany(StockOut, { foreignKey: 'userId', as: 'stockOuts' });

StockTransfer.belongsTo(Location, { foreignKey: 'sourceLocationId', as: 'source_location' });
StockTransfer.belongsTo(Location, { foreignKey: 'destinationLocationId', as: 'destination_location' });
Location.hasMany(StockTransfer, { foreignKey: 'sourceLocationId', as: 'sourceTransfers' });
Location.hasMany(StockTransfer, { foreignKey: 'destinationLocationId', as: 'destinationTransfers' });
StockTransfer.belongsTo(User, { foreignKey: 'requestedBy', as: 'requestedByUser' });
User.hasMany(StockTransfer, { foreignKey: 'requestedBy', as: 'requestedTransfers' });

DamagedStock.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
User.hasMany(DamagedStock, { foreignKey: 'reportedBy', as: 'damagedRecords' });

StockReturn.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(StockReturn, { foreignKey: 'created_by', as: 'stockReturns' });

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
  StockIn,
  StockInItem,
  StockOut,
  StockOutItem,
  StockTransfer,
  StockTransferItem,
  DamagedStock,
  StockReturn,
  StockReturnItem,
  StockDamagedItem,
};

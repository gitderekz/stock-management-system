const bcrypt = require('bcryptjs');
const {
  Category,
  Brand,
  Location,
  Supplier,
  User,
  Product,
  StockMovement,
  SystemLog,
  Settings,
  Notification,
  Role,
  Permission,
  RolePermission,
  Warehouse,
  ProductImage,
  ProductVideo,
  StockBalance,
} = require('./models');

const seedDatabase = async () => {
  // SETTINGS
  const defaultSettings = {
    systemName: 'StockFlow Operations',
    logoUrl: '/uploads/logo.png',
    defaultColor: '#2d6cdf',
    smtpHostname: process.env.CONTACTFORM_SMTP_HOSTNAME || 'smtp.gmail.com',
    smtpEmail: process.env.CONTACTFORM_SMTP_USERNAME || '',
    smtpPort: Number(process.env.CONTACTFORM_SMTP_PORT) || 465,
    locale: 'en',
  };
  await Settings.findOrCreate({ where: { id: 1 }, defaults: defaultSettings });

  // ROLES & PERMISSIONS
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'manager', description: 'Manager with limited access' },
    { name: 'engineer', description: 'Field engineer / operator' },
    { name: 'stock', description: 'Stock operator' },
    { name: 'auditor', description: 'Read-only auditor' },
  ];

  const permissionNames = [
    'products.manage',
    'categories.manage',
    'brands.manage',
    'locations.manage',
    'suppliers.manage',
    'stock.manage',
    'reports.view',
    'logs.view',
    'users.manage',
    'notifications.view',
  ];

  const createdRoles = {};
  for (const r of roles) {
    const [role] = await Role.findOrCreate({ where: { name: r.name }, defaults: r });
    createdRoles[r.name] = role;
  }

  const createdPermissions = {};
  for (const p of permissionNames) {
    const [perm] = await Permission.findOrCreate({ where: { name: p }, defaults: { name: p } });
    createdPermissions[p] = perm;
  }

  // assign all permissions to admin, most to manager
  for (const perm of Object.values(createdPermissions)) {
    await RolePermission.findOrCreate({ where: { roleId: createdRoles.admin.id, permissionId: perm.id }, defaults: { roleId: createdRoles.admin.id, permissionId: perm.id } });
  }
  // manager gets most permissions except users.manage
  for (const permName of permissionNames.filter(n => n !== 'users.manage')) {
    const perm = createdPermissions[permName];
    await RolePermission.findOrCreate({ where: { roleId: createdRoles.manager.id, permissionId: perm.id }, defaults: { roleId: createdRoles.manager.id, permissionId: perm.id } });
  }

  // stock role permissions
  const stockPerms = ['products.manage', 'stock.manage'];
  for (const pName of stockPerms) {
    const perm = createdPermissions[pName];
    if (perm) await RolePermission.findOrCreate({ where: { roleId: createdRoles.stock.id, permissionId: perm.id }, defaults: { roleId: createdRoles.stock.id, permissionId: perm.id } });
  }

  // auditor role permissions
  const auditorPerms = ['reports.view', 'logs.view'];
  for (const pName of auditorPerms) {
    const perm = createdPermissions[pName];
    if (perm) await RolePermission.findOrCreate({ where: { roleId: createdRoles.auditor.id, permissionId: perm.id }, defaults: { roleId: createdRoles.auditor.id, permissionId: perm.id } });
  }

  // USERS
  const [adminUser] = await User.findOrCreate({ where: { email: 'admin@example.com' }, defaults: { fullName: 'System Administrator', email: 'admin@example.com', passwordHash: bcrypt.hashSync('Admin1234!', 10), status: 'active', roleId: createdRoles.admin.id } });
  const [managerUser] = await User.findOrCreate({ where: { email: 'manager@example.com' }, defaults: { fullName: 'Operations Manager', email: 'manager@example.com', passwordHash: bcrypt.hashSync('Manager123!', 10), status: 'active', roleId: createdRoles.manager.id } });
  const [engineerUser] = await User.findOrCreate({ where: { email: 'eng@example.com' }, defaults: { fullName: 'Field Engineer', email: 'eng@example.com', passwordHash: bcrypt.hashSync('Engineer123!', 10), status: 'active', roleId: createdRoles.engineer.id } });

  // Additional test accounts
  const [stockUser1] = await User.findOrCreate({ where: { email: 'stock1@example.com' }, defaults: { fullName: 'Stock Operator 1', email: 'stock1@example.com', passwordHash: bcrypt.hashSync('Stock123!', 10), status: 'active', roleId: createdRoles.stock.id } });
  const [stockUser2] = await User.findOrCreate({ where: { email: 'stock2@example.com' }, defaults: { fullName: 'Stock Operator 2', email: 'stock2@example.com', passwordHash: bcrypt.hashSync('Stock123!', 10), status: 'active', roleId: createdRoles.stock.id } });
  const [auditorUser] = await User.findOrCreate({ where: { email: 'auditor@example.com' }, defaults: { fullName: 'System Auditor', email: 'auditor@example.com', passwordHash: bcrypt.hashSync('Audit123!', 10), status: 'active', roleId: createdRoles.auditor.id } });

  // SUPPLIERS, WAREHOUSES, LOCATIONS
  const [supplier1] = await Supplier.findOrCreate({ where: { email: 'sales@ncr.co.tz' }, defaults: { name: 'NCR East Africa', phone: '+255700000001', email: 'sales@ncr.co.tz', address: 'Dar es Salaam' } });
  const [supplier2] = await Supplier.findOrCreate({ where: { email: 'procurement@diebold.co.tz' }, defaults: { name: 'Diebold Nixdorf Tanzania', phone: '+255700000002', email: 'procurement@diebold.co.tz', address: 'Arusha' } });

  const [warehouseA] = await Warehouse.findOrCreate({ where: { code: 'WH-A' }, defaults: { name: 'Main Warehouse', code: 'WH-A', address: 'Dar es Salaam' } });

  const [locA] = await Location.findOrCreate({ where: { code: 'W-A' }, defaults: { name: 'Warehouse A', code: 'W-A', type: 'warehouse', address: 'Dar es Salaam' } });
  const [locB] = await Location.findOrCreate({ where: { code: 'ST-B' }, defaults: { name: 'Store B', code: 'ST-B', type: 'store', address: 'Arusha' } });
  const [locC] = await Location.findOrCreate({ where: { code: 'BR-C' }, defaults: { name: 'Branch C', code: 'BR-C', type: 'branch', address: 'Dodoma' } });

  // CATEGORIES & BRANDS
  const [category1] = await Category.findOrCreate({ where: { name: 'ATM Equipment' }, defaults: { name: 'ATM Equipment', description: 'ATM-related hardware and peripherals' } });
  const [category2] = await Category.findOrCreate({ where: { name: 'Networking' }, defaults: { name: 'Networking', description: 'Network devices and cables' } });
  const [category3] = await Category.findOrCreate({ where: { name: 'Spare Parts' }, defaults: { name: 'Spare Parts', description: 'Replacement parts and accessories' } });

  const [brand1] = await Brand.findOrCreate({ where: { name: 'NCR' }, defaults: { name: 'NCR', description: 'ATM hardware' } });
  const [brand2] = await Brand.findOrCreate({ where: { name: 'Diebold Nixdorf' }, defaults: { name: 'Diebold Nixdorf', description: 'Cash management and ATM solutions' } });
  const [brand3] = await Brand.findOrCreate({ where: { name: 'Cisco' }, defaults: { name: 'Cisco', description: 'Networking equipment' } });

  // PRODUCTS
  const products = [
    {
      name: 'ATM Peripheral Kit',
      price: 650000,
      condition: 'new',
      model: 'NCR-ATMKIT-V2',
      version: 'V2',
      serialCode: 'ATM-PK-001',
      quantity: 21,
      status: 'active',
      imageUrl: 'atm_kit.png',
      videoUrl: 'atm_kit.mp4',
      categoryId: category1.id,
      brandId: brand1.id,
      supplierId: supplier1.id,
    },
    {
      name: 'Cash Dispense Module',
      price: 2400000,
      condition: 'used',
      model: 'DB-CASSETTE-01',
      version: '01',
      serialCode: 'CDM-002',
      quantity: 8,
      status: 'active',
      imageUrl: 'cdm.png',
      videoUrl: 'cdm.mp4',
      categoryId: category3.id,
      brandId: brand2.id,
      supplierId: supplier2.id,
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const [prod] = await Product.findOrCreate({ where: { serialCode: p.serialCode }, defaults: p });
    createdProducts.push(prod);
    // create product media records (paths without leading /uploads)
    await ProductImage.findOrCreate({ where: { productId: prod.id, filePath: `products/${p.imageUrl}` }, defaults: { productId: prod.id, fileName: p.imageUrl, filePath: `products/${p.imageUrl}`, mimeType: 'image/png' } });
    await ProductVideo.findOrCreate({ where: { productId: prod.id, filePath: `products/${p.videoUrl}` }, defaults: { productId: prod.id, fileName: p.videoUrl, filePath: `products/${p.videoUrl}`, mimeType: 'video/mp4' } });
  }

  // STOCK BALANCES
  // STOCK BALANCES: use Sequelize model for idempotent seeding
  for (const prod of createdProducts) {
    await StockBalance.findOrCreate({ where: { productId: prod.id, locationId: locA.id }, defaults: { productId: prod.id, locationId: locA.id, quantity: prod.quantity, availableQuantity: prod.quantity, reservedQuantity: 0 } });
    await StockBalance.findOrCreate({ where: { productId: prod.id, locationId: locB.id }, defaults: { productId: prod.id, locationId: locB.id, quantity: Math.floor(prod.quantity / 3), availableQuantity: Math.floor(prod.quantity / 3), reservedQuantity: 0 } });
  }

  // STOCK MOVEMENTS (Legacy - updated to use new schema)
  // Note: In Phase 3, these are replaced by proper stock in/out operations via seedPhase2.js
  const movements = [
    { type: 'purchase', quantity: 10, reference: 'PUR-001', reason: 'Initial stock', product_id: createdProducts[0].id, from_location_id: null, to_location_id: locA.id, purpose: 'Initial stock', metadata: { supplier: supplier1.name } },
    { type: 'sale', quantity: 3, reference: 'OUT-001', reason: 'Field deployment', product_id: createdProducts[1].id, from_location_id: locB.id, to_location_id: null, purpose: 'Field deployment', metadata: { destination: 'Field Store' } },
  ];
  for (const m of movements) {
    // Use reference to uniquely identify, but don't query using from_location_id which may not exist yet
    await StockMovement.findOrCreate({ where: { reference: m.reference }, defaults: m }).catch(err => {
      console.warn(`StockMovement seed warning for ${m.reference}:`, err.message);
    });
  }

  // SYSTEM LOGS
  const logs = [
    { action: 'stock.receive', entity: 'stock_in', message: 'Received initial stock for ATM Peripheral Kit', userId: adminUser.id },
    { action: 'stock.issue', entity: 'stock_out', message: 'Issued Cash Dispense Module to field store', userId: managerUser.id },
  ];
  for (const log of logs) {
    await SystemLog.findOrCreate({ where: { action: log.action, entity: log.entity, message: log.message }, defaults: log });
  }

  // NOTIFICATIONS
  const notifications = [
    { title: 'Low stock alert', body: 'Cash Dispense Module is below reorder level', type: 'low_stock', seen: false, userId: managerUser.id },
    { title: 'Transfer approved', body: 'Transfer TR-2026-0001 approved', type: 'transfer', seen: false, userId: adminUser.id },
    { title: 'Damaged stock', body: '2 assets recorded as damaged', type: 'damage', seen: true, userId: engineerUser.id },
  ];
  for (const notification of notifications) {
    await Notification.findOrCreate({ where: { title: notification.title, body: notification.body }, defaults: notification });
  }
};

module.exports = { seedDatabase };

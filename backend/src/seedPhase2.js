// Enhanced seed for Phase 2: Taxes, Tariffs, PurchaseOrders, StockBatches
const {
  Tax,
  Tariff,
  PurchaseOrder,
  StockBatch,
  Supplier,
  User,
  Location,
  Product,
  RolePermission,
  Role,
  Permission,
} = require('./models');
const bcrypt = require('bcryptjs');

const seedPhase2 = async () => {
  try {
    console.log('Seeding Phase 2 data: Taxes, Tariffs, PurchaseOrders, StockBatches...');

    // ===== TAXES =====
    const taxes = [
      { name: 'VAT (18%)', code: 'VAT_18', rate: 18.00, type: 'VAT', is_inclusive: false, is_recoverable: true, active: true },
      { name: 'VAT (5%)', code: 'VAT_5', rate: 5.00, type: 'VAT', is_inclusive: false, is_recoverable: true, active: true },
      { name: 'Withholding Tax (5%)', code: 'WHT_5', rate: 5.00, type: 'WITHHOLDING', is_recoverable: false, active: true },
      { name: 'Import Tax (10%)', code: 'IMPORT_10', rate: 10.00, type: 'OTHER', active: true },
    ];
    for (const t of taxes) {
      await Tax.findOrCreate({ where: { code: t.code }, defaults: t });
    }
    console.log('✓ Taxes seeded');

    // ===== TARIFFS =====
    const tariffs = [
      { name: 'Standard Import Duty', code: 'IMPORT_DUTY', rate: 10.00, calculation_method: 'PERCENTAGE', active: true },
      { name: 'Express Shipping', code: 'EXPRESS_SHIP', rate: 500.00, calculation_method: 'FIXED_AMOUNT', active: true },
      { name: 'Insurance - Per Unit', code: 'INSURANCE_UNIT', rate: 2.50, calculation_method: 'PER_UNIT', active: true },
      { name: 'Customs Clearance', code: 'CUSTOMS_CLEAR', rate: 250.00, calculation_method: 'FIXED_AMOUNT', active: true },
    ];
    for (const t of tariffs) {
      await Tariff.findOrCreate({ where: { code: t.code }, defaults: t });
    }
    console.log('✓ Tariffs seeded');

    // ===== PERMISSIONS FOR BATCH/PO OPERATIONS =====
    const newPermissions = [
      { name: 'purchase_orders.manage' },
      { name: 'purchase_orders.view' },
      { name: 'settings.manage' },
      { name: 'stock_in.manage' },
      { name: 'stock_out.manage' },
      { name: 'stock_transfer.manage' },
      { name: 'reports.generate' },
    ];
    const createdPerms = {};
    for (const p of newPermissions) {
      const [perm] = await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
      createdPerms[p.name] = perm.id;
    }

    // Assign to admin all + to manager most
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const managerRole = await Role.findOne({ where: { name: 'manager' } });
    const stockRole = await Role.findOne({ where: { name: 'stock' } });

    const adminPerms = Object.values(createdPerms);
    for (const permId of adminPerms) {
      await RolePermission.findOrCreate({ 
        where: { roleId: adminRole.id, permissionId: permId },
        defaults: { roleId: adminRole.id, permissionId: permId }
      });
    }

    const managerPerms = [createdPerms['purchase_orders.view'], createdPerms['stock_in.manage'], createdPerms['stock_out.manage'], createdPerms['reports.generate']];
    for (const permId of managerPerms) {
      if (permId) {
        await RolePermission.findOrCreate({
          where: { roleId: managerRole.id, permissionId: permId },
          defaults: { roleId: managerRole.id, permissionId: permId }
        });
      }
    }

    const stockPerms = [createdPerms['stock_in.manage'], createdPerms['stock_out.manage'], createdPerms['stock_transfer.manage']];
    for (const permId of stockPerms) {
      if (permId) {
        await RolePermission.findOrCreate({
          where: { roleId: stockRole.id, permissionId: permId },
          defaults: { roleId: stockRole.id, permissionId: permId }
        });
      }
    }
    console.log('✓ Permissions seeded and assigned');

    // ===== PURCHASE ORDERS =====
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    const supplier1 = await Supplier.findOne({ where: { email: 'sales@ncr.co.tz' } });
    const supplier2 = await Supplier.findOne({ where: { email: 'procurement@diebold.co.tz' } });

    if (adminUser && supplier1) {
      const purchaseOrders = [
        { po_number: 'PO-2026-001', supplier_id: supplier1.id, po_status: 'COMPLETED', payment_status: 'PAID', delivery_status: 'RECEIVED', total_amount: 10000.00, total_paid: 10000.00, created_by: adminUser.id },
        { po_number: 'PO-2026-002', supplier_id: supplier2.id, po_status: 'ORDERED', payment_status: 'PARTIALLY_PAID', delivery_status: 'PARTIALLY_RECEIVED', total_amount: 25000.00, total_paid: 15000.00, created_by: adminUser.id },
        { po_number: 'PO-2026-003', supplier_id: supplier1.id, po_status: 'APPROVED', payment_status: 'UNPAID', delivery_status: 'PENDING', total_amount: 5000.00, total_paid: 0.00, created_by: adminUser.id },
      ];
      for (const po of purchaseOrders) {
        await PurchaseOrder.findOrCreate({ where: { po_number: po.po_number }, defaults: po });
      }
      console.log('✓ Purchase Orders seeded');
    }

    // ===== STOCK BATCHES =====
    const locA = await Location.findOne({ where: { code: 'W-A' } });
    const products = await Product.findAll({ limit: 2 });

    if (locA && products.length > 0) {
      const batches = [
        { product_id: products[0].id, location_id: locA.id, batch_number: 'B001-AP-001', quantity_received: 50, quantity_remaining: 35, unit_cost: 2000.00, unit_selling_price: 3500.00, landed_cost: 2200.00, received_at: new Date('2026-08-01'), condition: 'new' },
        { product_id: products[0].id, location_id: locA.id, batch_number: 'B001-AP-002', quantity_received: 30, quantity_remaining: 28, unit_cost: 2100.00, unit_selling_price: 3600.00, landed_cost: 2300.00, received_at: new Date('2026-08-05'), condition: 'new' },
        { product_id: products[1].id, location_id: locA.id, batch_number: 'B002-CDM-001', quantity_received: 10, quantity_remaining: 8, unit_cost: 45000.00, unit_selling_price: 65000.00, landed_cost: 48000.00, received_at: new Date('2026-08-03'), condition: 'used' },
      ];
      for (const batch of batches) {
        await StockBatch.findOrCreate({ where: { batch_number: batch.batch_number }, defaults: batch });
      }
      console.log('✓ Stock Batches seeded');
    }

    console.log('Phase 2 seeding completed successfully!');
  } catch (error) {
    console.error('Phase 2 seeding error:', error.message);
  }
};

module.exports = { seedPhase2 };

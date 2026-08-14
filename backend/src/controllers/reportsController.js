const { Op } = require('sequelize');
const { sequelize, Product, StockMovement, StockBatch, PurchaseOrder, User, Location, SystemLog } = require('../models');
const { createLog } = require('./logsController');

// Dashboard overview report
const getReports = async (req, res) => {
  const totalProducts = await Product.count();
  const totalStockValueRow = await Product.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.literal('price * quantity')), 'totalStockValue']],
    raw: true,
  });
  const totalStockValue = Number(totalStockValueRow.totalStockValue || 0);
  const lowStock = await Product.count({ where: { quantity: { [Op.lte]: 5 } } });
  const outOfStock = await Product.count({ where: { quantity: 0 } });
  const damaged = await StockMovement.count({ where: { type: 'damage' } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockInToday = await StockMovement.count({
    where: {
      type: ['purchase', 'in'],
      createdAt: { [Op.gte]: today },
    },
  });
  const stockOutToday = await StockMovement.count({
    where: {
      type: ['sale', 'out'],
      createdAt: { [Op.gte]: today },
    },
  });
  const transfersToday = await StockMovement.count({
    where: {
      type: 'transfer',
      createdAt: { [Op.gte]: today },
    },
  });
  const damagedToday = await StockMovement.count({
    where: {
      type: 'damage',
      createdAt: { [Op.gte]: today },
    },
  });

  const recentPurchases = await StockMovement.findAll({
    where: { type: ['purchase', 'in'] },
    attributes: ['metadata'],
    limit: 100,
    order: [['createdAt', 'DESC']],
  });

  const purchaseMap = {};
  recentPurchases.forEach((movement) => {
    const supplierId = movement.metadata?.supplierId || movement.metadata?.supplierName || 'unknown';
    const supplierName = movement.metadata?.supplierName || `Supplier ${supplierId}`;
    if (!purchaseMap[supplierName]) {
      purchaseMap[supplierName] = 0;
    }
    purchaseMap[supplierName] += Number(movement.metadata?.amount || 0);
  });

  const purchaseBySupplier = Object.keys(purchaseMap).map((supplier) => ({ supplier, value: purchaseMap[supplier] }));

  try { await createLog(req.user?.id || null, 'Report', 'read', null, `Generated reports overview`, { params: req.query }, req.ip); } catch (e) {}

  res.json({
    success: true,
    data: {
      inventory: {
        totalProducts,
        totalStockValue,
        lowStock,
        outOfStock,
        damaged,
      },
      movements: {
        stockInToday,
        stockOutToday,
        transfersToday,
        damagedToday,
      },
      purchases: {
        totalPurchases: Object.values(purchaseMap).reduce((sum, value) => sum + value, 0),
        purchaseBySupplier,
      },
    },
  });
};

// Stock Valuation Report
const generateStockValuation = async (req, res) => {
  try {
    const batches = await StockBatch.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
      ],
      where: { quantity_remaining: { [Op.gt]: 0 } },
    });

    const valuation = batches.map(b => ({
      product_id: b.product_id,
      product_name: b.product?.name || 'Unknown',
      sku: b.product?.sku || '-',
      location: b.location?.name || 'Unknown',
      batch_number: b.batch_number,
      quantity: b.quantity_remaining,
      unit_cost: parseFloat(b.unit_cost),
      landed_cost: parseFloat(b.landed_cost),
      unit_selling_price: parseFloat(b.unit_selling_price),
      total_cost: parseFloat(b.unit_cost) * b.quantity_remaining,
      total_landed_value: parseFloat(b.landed_cost) * b.quantity_remaining,
      total_selling_value: parseFloat(b.unit_selling_price) * b.quantity_remaining,
      condition: b.condition,
      received_at: b.received_at,
    }));

    const summary = {
      total_units: valuation.reduce((sum, v) => sum + v.quantity, 0),
      total_cost: valuation.reduce((sum, v) => sum + v.total_cost, 0),
      total_landed_value: valuation.reduce((sum, v) => sum + v.total_landed_value, 0),
      total_selling_value: valuation.reduce((sum, v) => sum + v.total_selling_value, 0),
      gross_margin: 0,
    };

    if (summary.total_selling_value > 0) {
      summary.gross_margin = ((summary.total_selling_value - summary.total_landed_value) / summary.total_selling_value) * 100;
    }

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated stock valuation report', { type: 'stock_valuation' }, req.ip);

    res.json({
      success: true,
      report_type: 'stock_valuation',
      generated_at: new Date(),
      summary,
      data: valuation,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FIFO Cost Report
const generateFIFOCostReport = async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      where: { type: 'out' },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const cogs_data = movements.map(m => {
      const allocations = m.batch_allocations ? JSON.parse(m.batch_allocations) : [];
      return {
        movement_id: m.id,
        product_name: m.product?.name || 'Unknown',
        sku: m.product?.sku || '-',
        quantity_issued: m.quantity,
        issued_by: m.issuer?.fullName || 'System',
        issued_at: m.createdAt,
        total_cost: parseFloat(m.total_cost),
        unit_cost: parseFloat(m.unit_cost),
        reference: m.reference,
        batch_allocations: allocations.map(a => ({
          batch_number: a.batch_number,
          quantity: a.quantity,
          unit_cost: a.unit_cost,
          total: a.total_cost,
        })),
      };
    });

    const summary = {
      total_movements: cogs_data.length,
      total_units_issued: cogs_data.reduce((sum, d) => sum + d.quantity_issued, 0),
      total_cogs: cogs_data.reduce((sum, d) => sum + d.total_cost, 0),
      average_cost_per_unit: 0,
    };

    if (summary.total_units_issued > 0) {
      summary.average_cost_per_unit = summary.total_cogs / summary.total_units_issued;
    }

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated FIFO cost report', { type: 'fifo_cost' }, req.ip);

    res.json({
      success: true,
      report_type: 'fifo_cost',
      generated_at: new Date(),
      summary,
      data: cogs_data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Low Stock Alert Report
const generateLowStockAlert = async (req, res) => {
  try {
    const { reorder_level = 5 } = req.query;

    const products = await Product.findAll({
      attributes: ['id', 'name', 'sku', 'quantity'],
      where: { quantity: { [Op.lte]: reorder_level } },
    });

    const alerts = await Promise.all(
      products.map(async (product) => {
        const batches = await StockBatch.findAll({
          where: { product_id: product.id, quantity_remaining: { [Op.gt]: 0 } },
        });

        const totalRemaining = batches.reduce((sum, b) => sum + b.quantity_remaining, 0);

        return {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          recorded_quantity: product.quantity,
          actual_remaining: totalRemaining,
          reorder_level: parseInt(reorder_level),
          alert_level: 'LOW',
          batches: batches.length,
          oldest_batch_date: batches.length > 0 ? Math.min(...batches.map(b => new Date(b.received_at))) : null,
        };
      })
    );

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated low stock alert report', { type: 'low_stock_alert' }, req.ip);

    res.json({
      success: true,
      report_type: 'low_stock_alert',
      generated_at: new Date(),
      reorder_level: parseInt(reorder_level),
      summary: {
        total_alerts: alerts.length,
        critical_count: alerts.filter(a => a.actual_remaining === 0).length,
      },
      data: alerts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stock Movements Summary Report
const generateMovementsSummary = async (req, res) => {
  try {
    const { start_date, end_date, movement_type } = req.query;

    const where = {};
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }
    if (movement_type) where.type = movement_type;

    const movements = await StockMovement.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Location, as: 'from_location', attributes: ['id', 'name'] },
        { model: Location, as: 'to_location', attributes: ['id', 'name'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const summary_by_type = {};
    const summary_by_product = {};

    movements.forEach(m => {
      if (!summary_by_type[m.type]) {
        summary_by_type[m.type] = { count: 0, total_quantity: 0, total_value: 0 };
      }
      summary_by_type[m.type].count++;
      summary_by_type[m.type].total_quantity += m.quantity;
      summary_by_type[m.type].total_value += parseFloat(m.total_cost || 0);

      const prod_key = m.product?.name || 'Unknown';
      if (!summary_by_product[prod_key]) {
        summary_by_product[prod_key] = { count: 0, total_quantity: 0, total_value: 0 };
      }
      summary_by_product[prod_key].count++;
      summary_by_product[prod_key].total_quantity += m.quantity;
      summary_by_product[prod_key].total_value += parseFloat(m.total_cost || 0);
    });

    const data = movements.map(m => ({
      movement_id: m.id,
      type: m.type,
      product: m.product?.name || 'Unknown',
      sku: m.product?.sku || '-',
      quantity: m.quantity,
      from_location: m.from_location?.name || '-',
      to_location: m.to_location?.name || '-',
      value: parseFloat(m.total_cost || 0),
      purpose: m.purpose,
      reference: m.reference,
      performed_by: m.issuer?.fullName || 'System',
      timestamp: m.createdAt,
    }));

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated movements summary report', { type: 'movements_summary' }, req.ip);

    res.json({
      success: true,
      report_type: 'movements_summary',
      generated_at: new Date(),
      period: { start_date, end_date },
      summary: {
        total_movements: movements.length,
        by_type: summary_by_type,
        by_product: summary_by_product,
      },
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Purchase Order Report
const generatePurchaseOrderReport = async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;

    const where = {};
    if (status) where.po_status = status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const Supplier = require('../models').Supplier;
    const pos = await PurchaseOrder.findAll({
      where,
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        { model: StockBatch, as: 'batches' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = pos.map(po => ({
      po_id: po.id,
      po_number: po.po_number,
      supplier: po.supplier?.name || 'Unknown',
      po_status: po.po_status,
      payment_status: po.payment_status,
      delivery_status: po.delivery_status,
      total_amount: parseFloat(po.total_amount),
      total_paid: parseFloat(po.total_paid),
      balance_due: parseFloat(po.total_amount) - parseFloat(po.total_paid),
      order_date: po.order_date,
      expected_delivery: po.expected_delivery,
      actual_delivery: po.actual_delivery,
      batches_received: po.batches?.length || 0,
      created_by: po.creator?.fullName || 'System',
      created_at: po.createdAt,
    }));

    const summary = {
      total_pos: data.length,
      total_amount: data.reduce((sum, d) => sum + d.total_amount, 0),
      total_paid: data.reduce((sum, d) => sum + d.total_paid, 0),
      total_balance_due: data.reduce((sum, d) => sum + d.balance_due, 0),
      by_status: {},
      by_payment: {},
    };

    data.forEach(d => {
      summary.by_status[d.po_status] = (summary.by_status[d.po_status] || 0) + 1;
      summary.by_payment[d.payment_status] = (summary.by_payment[d.payment_status] || 0) + 1;
    });

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated purchase order report', { type: 'purchase_orders' }, req.ip);

    res.json({
      success: true,
      report_type: 'purchase_orders',
      generated_at: new Date(),
      filters: { status, start_date, end_date },
      summary,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Audit Trail Report
const generateAuditTrail = async (req, res) => {
  try {
    const { user_id, entity, action, start_date, end_date, limit = 500 } = req.query;

    const where = {};
    if (user_id) where.userId = user_id;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const logs = await SystemLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });

    const data = logs.map(log => ({
      log_id: log.id,
      timestamp: log.createdAt,
      user: log.user?.fullName || 'System',
      user_email: log.user?.email || '-',
      action: log.action,
      entity: log.entity,
      entity_id: log.entityId,
      message: log.message,
      ip_address: log.ipAddress,
      changes: log.changes,
    }));

    const action_count = {};
    data.forEach(d => {
      action_count[d.action] = (action_count[d.action] || 0) + 1;
    });

    await createLog(req.user?.id || null, 'Report', 'generate', null, 'Generated audit trail report', { type: 'audit_trail' }, req.ip);

    res.json({
      success: true,
      report_type: 'audit_trail',
      generated_at: new Date(),
      filters: { user_id, entity, action, start_date, end_date },
      summary: {
        total_events: data.length,
        by_action: action_count,
      },
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getReports,
  generateStockValuation,
  generateFIFOCostReport,
  generateLowStockAlert,
  generateMovementsSummary,
  generatePurchaseOrderReport,
  generateAuditTrail,
};

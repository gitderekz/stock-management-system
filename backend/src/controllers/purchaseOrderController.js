const { PurchaseOrder, Supplier, User, StockBatch, Product, PurchaseOrderItem, Brand, Category } = require('../models');
const { createLog } = require('./logsController');

// Calculate landed cost per unit
const calculateLandedCost = (unitCost, shippingPerUnit, tariffPerUnit, taxPerUnit) => {
  return parseFloat(unitCost) + parseFloat(shippingPerUnit || 0) + parseFloat(tariffPerUnit || 0) + parseFloat(taxPerUnit || 0);
};

// List all purchase orders
const listPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.findAll({
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        { model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }] },
        { model: StockBatch, as: 'batches' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = pos.map(po => ({
      id: po.id,
      po_number: po.po_number,
      supplier: po.supplier?.name || 'Unknown',
      po_status: po.po_status,
      payment_status: po.payment_status,
      delivery_status: po.delivery_status,
      total_amount: po.total_amount,
      total_paid: po.total_paid,
      order_date: po.order_date,
      expected_delivery: po.expected_delivery,
      actual_delivery: po.actual_delivery,
      item_count: po.items?.length || 0,
      batches_created: po.batches?.length || 0,
      created_by: po.creator?.fullName || 'System',
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single PO with all details including items
const getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        {
          model: PurchaseOrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            include: [
              { model: Brand, as: 'brand', attributes: ['id', 'name'] },
              { model: Category, as: 'category', attributes: ['id', 'name'] },
            ],
            attributes: ['id', 'name', 'sku', 'price', 'quantity'],
          }],
          separate: true,
        },
        { model: StockBatch, as: 'batches', include: [{ model: Product, as: 'product' }] },
      ],
    });

    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    // Enrich items with calculated values
    const enrichedItems = (po.items || []).map(item => ({
      ...item.toJSON(),
      total_cost: item.quantity * parseFloat(item.unit_cost),
      landed_cost: item.landed_cost || calculateLandedCost(item.unit_cost, item.shipping_per_unit, item.tariff_per_unit, item.tax_per_unit),
    }));

    res.json({ success: true, data: { ...po.toJSON(), items: enrichedItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create PO with line items
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, po_number, expected_delivery, notes, items } = req.body;

    if (!supplier_id || !po_number) {
      return res.status(400).json({ success: false, message: 'supplier_id and po_number required' });
    }

    // Check unique
    const existing = await PurchaseOrder.findOne({ where: { po_number } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'PO number already exists' });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    if (items && Array.isArray(items)) {
      totalAmount = items.reduce((sum, item) => {
        const costPerItem = (item.quantity || 1) * parseFloat(item.unit_cost || 0);
        return sum + costPerItem;
      }, 0);
    }

    const po = await PurchaseOrder.create({
      supplier_id,
      po_number,
      po_status: 'DRAFT',
      payment_status: 'UNPAID',
      delivery_status: 'PENDING',
      total_amount: totalAmount,
      total_paid: 0,
      expected_delivery: expected_delivery || null,
      notes: notes || null,
      created_by: req.user?.id || null,
    });

    // Add line items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      const itemsData = items.map(item => ({
        purchase_order_id: po.id,
        product_id: item.product_id,
        quantity: item.quantity || 1,
        unit_cost: item.unit_cost,
        unit_selling_price: item.unit_selling_price || null,
        shipping_per_unit: item.shipping_per_unit || 0,
        tariff_per_unit: item.tariff_per_unit || 0,
        tax_per_unit: item.tax_per_unit || 0,
        landed_cost: calculateLandedCost(item.unit_cost, item.shipping_per_unit, item.tariff_per_unit, item.tax_per_unit),
        total_cost: (item.quantity || 1) * parseFloat(item.unit_cost || 0),
        notes: item.notes || null,
      }));

      await PurchaseOrderItem.bulkCreate(itemsData);
    }

    await createLog(req.user?.id, 'PurchaseOrder', 'create', po.id, `Created PO ${po_number}`, { po_number, item_count: items?.length || 0 }, req.ip);

    // Fetch with items
    const poWithItems = await getPurchaseOrderDetail(po.id);
    res.status(201).json({ success: true, message: 'Purchase order created', data: poWithItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper to fetch PO with all details
const getPurchaseOrderDetail = async (poId) => {
  return await PurchaseOrder.findByPk(poId, {
    include: [
      { model: Supplier, as: 'supplier' },
      { model: User, as: 'creator', attributes: ['id', 'fullName'] },
      { 
        model: PurchaseOrderItem, 
        as: 'items', 
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
      },
    ],
  });
};

// Update PO
const updatePurchaseOrder = async (req, res) => {
  try {
    const { po_status, payment_status, delivery_status, total_amount, total_paid, expected_delivery, actual_delivery, notes } = req.body;

    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    await po.update({
      po_status: po_status || po.po_status,
      payment_status: payment_status || po.payment_status,
      delivery_status: delivery_status || po.delivery_status,
      total_amount: total_amount !== undefined ? total_amount : po.total_amount,
      total_paid: total_paid !== undefined ? total_paid : po.total_paid,
      expected_delivery: expected_delivery !== undefined ? expected_delivery : po.expected_delivery,
      actual_delivery: actual_delivery !== undefined ? actual_delivery : po.actual_delivery,
      notes: notes !== undefined ? notes : po.notes,
    });

    await createLog(req.user?.id, 'PurchaseOrder', 'update', po.id, `Updated PO ${po.po_number}`, { changes: req.body }, req.ip);

    res.json({ success: true, message: 'Purchase order updated', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add item to PO
const addPurchaseOrderItem = async (req, res) => {
  try {
    const { po_id } = req.params;
    const { product_id, quantity, unit_cost, unit_selling_price, shipping_per_unit, tariff_per_unit, tax_per_unit, notes } = req.body;

    if (!product_id || !quantity || !unit_cost) {
      return res.status(400).json({ success: false, message: 'product_id, quantity, and unit_cost required' });
    }

    const po = await PurchaseOrder.findByPk(po_id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    const landed_cost = calculateLandedCost(unit_cost, shipping_per_unit, tariff_per_unit, tax_per_unit);
    const total_cost = quantity * parseFloat(unit_cost);

    const item = await PurchaseOrderItem.create({
      purchase_order_id: po_id,
      product_id,
      quantity,
      unit_cost,
      unit_selling_price: unit_selling_price || null,
      shipping_per_unit: shipping_per_unit || 0,
      tariff_per_unit: tariff_per_unit || 0,
      tax_per_unit: tax_per_unit || 0,
      landed_cost,
      total_cost,
      notes: notes || null,
    });

    // Recalculate PO total
    const items = await PurchaseOrderItem.findAll({ where: { purchase_order_id: po_id } });
    const newTotal = items.reduce((sum, i) => sum + parseFloat(i.total_cost || 0), 0);
    await po.update({ total_amount: newTotal });

    await createLog(req.user?.id, 'PurchaseOrderItem', 'create', item.id, `Added item to PO ${po.po_number}`, { product_id, quantity }, req.ip);

    res.status(201).json({ success: true, message: 'Item added to purchase order', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update item in PO
const updatePurchaseOrderItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity, unit_cost, unit_selling_price, shipping_per_unit, tariff_per_unit, tax_per_unit, notes } = req.body;

    const item = await PurchaseOrderItem.findByPk(item_id);
    if (!item) return res.status(404).json({ success: false, message: 'Purchase order item not found' });

    const landedCost = calculateLandedCost(unit_cost || item.unit_cost, shipping_per_unit || item.shipping_per_unit, tariff_per_unit || item.tariff_per_unit, tax_per_unit || item.tax_per_unit);
    const totalCost = (quantity || item.quantity) * parseFloat(unit_cost || item.unit_cost);

    await item.update({
      quantity: quantity !== undefined ? quantity : item.quantity,
      unit_cost: unit_cost || item.unit_cost,
      unit_selling_price: unit_selling_price !== undefined ? unit_selling_price : item.unit_selling_price,
      shipping_per_unit: shipping_per_unit !== undefined ? shipping_per_unit : item.shipping_per_unit,
      tariff_per_unit: tariff_per_unit !== undefined ? tariff_per_unit : item.tariff_per_unit,
      tax_per_unit: tax_per_unit !== undefined ? tax_per_unit : item.tax_per_unit,
      landed_cost: landedCost,
      total_cost: totalCost,
      notes: notes !== undefined ? notes : item.notes,
    });

    // Recalculate PO total
    const po = await PurchaseOrder.findByPk(item.purchase_order_id);
    const items = await PurchaseOrderItem.findAll({ where: { purchase_order_id: item.purchase_order_id } });
    const newTotal = items.reduce((sum, i) => sum + parseFloat(i.total_cost || 0), 0);
    await po.update({ total_amount: newTotal });

    await createLog(req.user?.id, 'PurchaseOrderItem', 'update', item.id, `Updated item in PO`, { changes: req.body }, req.ip);

    res.json({ success: true, message: 'Item updated', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove item from PO
const deletePurchaseOrderItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    const item = await PurchaseOrderItem.findByPk(item_id);
    if (!item) return res.status(404).json({ success: false, message: 'Purchase order item not found' });

    const poId = item.purchase_order_id;
    await item.destroy();

    // Recalculate PO total
    const po = await PurchaseOrder.findByPk(poId);
    const items = await PurchaseOrderItem.findAll({ where: { purchase_order_id: poId } });
    const newTotal = items.reduce((sum, i) => sum + parseFloat(i.total_cost || 0), 0);
    await po.update({ total_amount: newTotal });

    await createLog(req.user?.id, 'PurchaseOrderItem', 'delete', item_id, `Removed item from PO`, null, req.ip);

    res.json({ success: true, message: 'Item removed from purchase order' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete PO (only if DRAFT status)
const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    if (po.po_status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Can only delete DRAFT purchase orders' });
    }

    const poNumber = po.po_number;
    
    // Delete all items first
    await PurchaseOrderItem.destroy({ where: { purchase_order_id: po.id } });
    await po.destroy();

    await createLog(req.user?.id, 'PurchaseOrder', 'delete', po.id, `Deleted PO ${poNumber}`, null, req.ip);

    res.json({ success: true, message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  addPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,
};

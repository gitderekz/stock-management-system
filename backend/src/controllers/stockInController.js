const { StockMovement, StockBatch, Product, Location, PurchaseOrder, PurchaseOrderItem, User } = require('../models');
const { createLog } = require('./logsController');
const { v4: uuidv4 } = require('uuid');

// List all stock in movements
const listStockIn = async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      where: { type: 'in' },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'to_location', attributes: ['id', 'name'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = movements.map(m => ({
      id: m.id,
      product: m.product?.name || 'Unknown',
      quantity: m.quantity,
      location: m.to_location?.name || 'Unknown',
      reference: m.reference,
      received_by: m.issuer?.fullName || 'System',
      received_at: m.createdAt,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single stock in
const getStockIn = async (req, res) => {
  try {
    const movement = await StockMovement.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Location, as: 'to_location' },
        { model: User, as: 'issuer' },
      ],
    });

    if (!movement || movement.type !== 'in') {
      return res.status(404).json({ success: false, message: 'Stock in not found' });
    }

    res.json({ success: true, data: movement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Receive goods and create batch(es). Supports receiving from a Purchase Order (multiple items)
const receiveGoods = async (req, res) => {
  try {
    const {
      purchase_order_id,
      location_id,
      items, // optional array of { purchase_order_item_id, product_id, quantity_received, unit_cost, landed_cost }
      inspection_notes,
      received_by,
    } = req.body;

    if (!location_id) {
      return res.status(400).json({ success: false, message: 'location_id is required' });
    }

    const location = await Location.findByPk(location_id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    let po = null;
    if (purchase_order_id) {
      po = await PurchaseOrder.findByPk(purchase_order_id, {
        include: [{ model: PurchaseOrderItem, as: 'items' }],
      });
      if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    // Build receive list: either from provided items or from PO items
    let receiveList = [];
    if (items && Array.isArray(items) && items.length > 0) {
      receiveList = items.map(i => ({
        purchase_order_item_id: i.purchase_order_item_id || null,
        product_id: i.product_id,
        quantity_received: parseInt(i.quantity_received, 10) || 0,
        unit_cost: i.unit_cost !== undefined ? parseFloat(i.unit_cost) : undefined,
        landed_cost: i.landed_cost !== undefined ? parseFloat(i.landed_cost) : undefined,
      }));
    } else if (po) {
      receiveList = (po.items || []).map(i => ({
        purchase_order_item_id: i.id,
        product_id: i.product_id,
        quantity_received: i.quantity,
        unit_cost: parseFloat(i.unit_cost),
        landed_cost: i.landed_cost ? parseFloat(i.landed_cost) : parseFloat(i.unit_cost),
      }));
    } else {
      return res.status(400).json({ success: false, message: 'No items to receive. Provide purchase_order_id or items array.' });
    }

    const createdBatches = [];

    for (const entry of receiveList) {
      if (!entry.product_id || !entry.quantity_received || entry.quantity_received <= 0) continue;

      const product = await Product.findByPk(entry.product_id);
      if (!product) continue; // skip missing product

      // Generate batch number using uuid fragment to avoid collisions
      const batch_number = `${product.name.substring(0,4).toUpperCase()}-${location.name.substring(0,4).toUpperCase()}-${uuidv4().split('-')[0]}`;

      const batch = await StockBatch.create({
        batch_number,
        product_id: entry.product_id,
        location_id,
        purchase_order_id: purchase_order_id || null,
        quantity_received: parseInt(entry.quantity_received, 10),
        quantity_remaining: parseInt(entry.quantity_received, 10),
        unit_cost: entry.unit_cost !== undefined ? parseFloat(entry.unit_cost) : (product.cost || 0),
        unit_selling_price: 0,
        landed_cost: entry.landed_cost !== undefined ? parseFloat(entry.landed_cost) : (entry.unit_cost !== undefined ? parseFloat(entry.unit_cost) : 0),
        condition: 'new',
        received_at: new Date(),
        received_by: received_by || req.user?.id || null,
        inspection_notes: inspection_notes || null,
      });

      // create stock movement
      const movement = await StockMovement.create({
        type: 'in',
        product_id: entry.product_id,
        from_location_id: null,
        to_location_id: location_id,
        quantity: parseInt(entry.quantity_received, 10),
        unit_cost: batch.unit_cost || 0,
        total_cost: (batch.unit_cost || 0) * parseInt(entry.quantity_received, 10),
        purpose: purchase_order_id ? `PO Delivery (${po.po_number})` : 'Stock In',
        reference: purchase_order_id ? po.po_number : null,
        issued_by: received_by || req.user?.id || null,
        notes: `Batch ${batch_number} created from receive`,
      });

      createdBatches.push({ batch, movement });

      await createLog(
        req.user?.id,
        'StockBatch',
        'create',
        batch.id,
        `Stock received: ${product.name} x${entry.quantity_received} to ${location.name}`,
        { batch_number, product_id: entry.product_id, location_id, quantity_received: entry.quantity_received, po_id: purchase_order_id },
        req.ip
      );
    }

    // Update PO delivery status if PO provided
    if (po) {
      const totalOrdered = (po.items || []).reduce((s, it) => s + (it.quantity || 0), 0);
      const totalReceivedRows = await StockBatch.findAll({ where: { purchase_order_id: po.id } });
      const totalReceived = totalReceivedRows.reduce((s, b) => s + (b.quantity_received || 0), 0);

      let newDeliveryStatus = 'PENDING';
      if (totalReceived <= 0) newDeliveryStatus = 'PENDING';
      else if (totalReceived < totalOrdered) newDeliveryStatus = 'PARTIALLY_RECEIVED';
      else newDeliveryStatus = 'RECEIVED';

      await po.update({ delivery_status: newDeliveryStatus, actual_delivery: new Date() });
    }

    res.status(201).json({ success: true, message: 'Goods received', data: { batches: createdBatches.map(b => ({ id: b.batch.id, batch_number: b.batch.batch_number })) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update batch details (after receiving and inspection)
const updateBatchDetails = async (req, res) => {
  try {
    const { unit_selling_price, condition, inspection_notes } = req.body;

    const batch = await StockBatch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    await batch.update({
      unit_selling_price: unit_selling_price !== undefined ? parseFloat(unit_selling_price) : batch.unit_selling_price,
      condition: condition || batch.condition,
      inspection_notes: inspection_notes !== undefined ? inspection_notes : batch.inspection_notes,
    });

    await createLog(
      req.user?.id,
      'StockBatch',
      'update',
      batch.id,
      `Updated batch ${batch.batch_number}`,
      { changes: req.body },
      req.ip
    );

    res.json({ success: true, message: 'Batch details updated', data: batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List batches for a product/location
const listBatches = async (req, res) => {
  try {
    const { product_id, location_id, include_empty } = req.query;

    const where = {};
    if (product_id) where.product_id = product_id;
    if (location_id) where.location_id = location_id;
    if (!include_empty) where.quantity_remaining = { [require('../models').sequelize.Op.gt]: 0 };

    const batches = await StockBatch.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: PurchaseOrder, as: 'purchase_order', attributes: ['id', 'po_number'] },
      ],
      order: [['received_at', 'ASC']],
    });

    const data = batches.map(b => ({
      id: b.id,
      batch_number: b.batch_number,
      product: b.product?.name,
      location: b.location?.name,
      quantity_received: b.quantity_received,
      quantity_remaining: b.quantity_remaining,
      unit_cost: b.unit_cost,
      unit_selling_price: b.unit_selling_price,
      landed_cost: b.landed_cost,
      condition: b.condition,
      po_number: b.purchase_order?.po_number || null,
      received_at: b.received_at,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get batch details
const getBatchDetails = async (req, res) => {
  try {
    const batch = await StockBatch.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Location, as: 'location' },
        { model: PurchaseOrder, as: 'purchase_order' },
      ],
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.json({ success: true, data: batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listStockIn,
  getStockIn,
  receiveGoods,
  updateBatchDetails,
  listBatches,
  getBatchDetails,
};

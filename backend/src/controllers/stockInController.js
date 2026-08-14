const { StockMovement, StockBatch, Product, Location, PurchaseOrder, User } = require('../models');
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

// Receive goods and create batch
const receiveGoods = async (req, res) => {
  try {
    const {
      product_id,
      location_id,
      quantity_received,
      purchase_order_id,
      unit_cost,
      landed_cost,
      condition,
      inspection_notes,
    } = req.body;

    if (!product_id || !location_id || !quantity_received) {
      return res.status(400).json({
        success: false,
        message: 'product_id, location_id, and quantity_received required',
      });
    }

    if (quantity_received <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
    }

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check location exists
    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Check purchase order if provided
    let po = null;
    if (purchase_order_id) {
      po = await PurchaseOrder.findByPk(purchase_order_id);
      if (!po) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }
    }

    // Generate batch number (format: PPPP-LLLL-###)
    // PPPP = first 4 letters of product name (uppercase)
    // LLLL = first 4 letters of location name (uppercase)
    // ### = sequential counter
    const prodPrefix = product.name.substring(0, 4).toUpperCase();
    const locPrefix = location.name.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const batch_number = `${prodPrefix}-${locPrefix}-${randomNum}`;

    // Create stock batch
    const batch = await StockBatch.create({
      batch_number,
      product_id,
      location_id,
      purchase_order_id: purchase_order_id || null,
      quantity_received: parseInt(quantity_received),
      quantity_remaining: parseInt(quantity_received),
      unit_cost: parseFloat(unit_cost) || 0,
      unit_selling_price: 0, // To be set later
      landed_cost: parseFloat(landed_cost) || parseFloat(unit_cost) || 0,
      condition: condition || 'new',
      received_at: new Date(),
      received_by: req.user?.id || null,
      inspection_notes: inspection_notes || null,
    });

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'in',
      product_id,
      from_location_id: null,
      to_location_id: location_id,
      quantity: parseInt(quantity_received),
      unit_cost: parseFloat(unit_cost) || 0,
      total_cost: (parseFloat(unit_cost) || 0) * parseInt(quantity_received),
      purpose: purchase_order_id ? `PO Delivery (${po.po_number})` : 'Stock In',
      reference: purchase_order_id ? po.po_number : null,
      issued_by: req.user?.id || null,
      notes: `Batch ${batch_number} created`,
    });

    // Update PO delivery status if provided
    if (po) {
      const currentDelivered = po.delivery_status;
      let newDeliveryStatus = 'PARTIALLY_RECEIVED';

      // If quantities match or exceed, mark as RECEIVED
      if (quantity_received >= (po.total_amount / po.total_amount)) {
        newDeliveryStatus = 'RECEIVED';
      }

      await po.update({
        delivery_status: newDeliveryStatus,
        actual_delivery: new Date(),
      });
    }

    await createLog(
      req.user?.id,
      'StockBatch',
      'create',
      batch.id,
      `Stock received: ${product.name} x${quantity_received} to ${location.name}`,
      { batch_number, product_id, location_id, quantity_received, po_id: purchase_order_id },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Goods received and batch created',
      data: {
        batch_id: batch.id,
        batch_number,
        product: product.name,
        location: location.name,
        quantity_received,
        unit_cost,
        landed_cost,
        movement_id: movement.id,
      },
    });
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

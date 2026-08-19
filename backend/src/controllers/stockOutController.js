const { StockMovement, StockBatch, Product, Location, User, StockOut, StockOutItem } = require('../models');
const { createLog } = require('./logsController');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// FIFO Allocation Algorithm
const allocateWithFIFO = async (productId, locationId, requestedQty) => {
  // Get all batches sorted by received_at (oldest first) - FIFO order
  const batches = await StockBatch.findAll({
    where: { 
      product_id: productId, 
      location_id: locationId,
      quantity_remaining: { [Op.gt]: 0 } // Only non-empty batches
    },
    order: [['received_at', 'ASC']],
    attributes: ['id', 'batch_number', 'quantity_remaining', 'unit_cost', 'unit_selling_price', 'received_at'],
  });

  if (batches.length === 0) {
    throw new Error(`No stock available for product ${productId} at location ${locationId}`);
  }

  const allocations = [];
  let remainingQty = requestedQty;

  for (const batch of batches) {
    if (remainingQty <= 0) break;

    const qtyToTake = Math.min(remainingQty, batch.quantity_remaining);
    const unitPrice = Number(batch.unit_selling_price ?? batch.unit_cost ?? 0);

    allocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: qtyToTake,
      unit_cost: unitPrice,
      total_cost: parseFloat(unitPrice) * qtyToTake,
    });

    await batch.update({
      quantity_remaining: batch.quantity_remaining - qtyToTake,
    });

    remainingQty -= qtyToTake;
  }

  if (remainingQty > 0) {
    throw new Error(
      `Insufficient inventory: requested ${requestedQty}, allocated ${requestedQty - remainingQty}`
    );
  }

  return allocations;
};

// Manual allocation (user selects specific batches)
const allocateManual = async (productId, locationId, batchAllocations) => {
  // batchAllocations = [{ batch_id, quantity }, ...]
  const allocations = [];
  let totalAllocated = 0;

  for (const ba of batchAllocations) {
    const batch = await StockBatch.findByPk(ba.batch_id);
    if (!batch) {
      throw new Error(`Batch ${ba.batch_id} not found`);
    }

    if (batch.quantity_remaining < ba.quantity) {
      throw new Error(
        `Batch ${batch.batch_number} has insufficient quantity: ${batch.quantity_remaining} < ${ba.quantity}`
      );
    }

    const unitPrice = Number(batch.unit_selling_price ?? batch.unit_cost ?? 0);
    allocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: ba.quantity,
      unit_cost: unitPrice,
      total_cost: parseFloat(unitPrice) * ba.quantity,
    });

    await batch.update({
      quantity_remaining: batch.quantity_remaining - ba.quantity,
    });

    totalAllocated += ba.quantity;
  }

  return allocations;
};

// List all stock out records from the dedicated stock_out table
const listStockOut = async (req, res) => {
  try {
    const rows = await StockOut.findAll({
      include: [
        { model: StockOutItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['issuedAt', 'DESC']],
    });

    const data = rows.map((row) => {
      const itemTotal = (row.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const fifoValue = (row.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

      return {
        id: row.id,
        reference: row.referenceNo,
        product: row.items?.[0]?.product?.name || 'Unknown',
        product_id: row.items?.[0]?.productId || null,
        quantity: itemTotal,
        location_id: row.locationId,
        location: row.location?.name || 'Unknown',
        purpose: row.purpose,
        recipient: row.recipient,
        cost_fifo: fifoValue,
        issued_by: row.issuer?.fullName || 'System',
        issued_at: row.issuedAt || row.createdAt,
        status: row.status,
        created_at: row.createdAt,
      };
    });

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single stock out from stock_out table
const getStockOut = async (req, res) => {
  try {
    const row = await StockOut.findByPk(req.params.id, {
      include: [
        { model: StockOutItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Location, as: 'location' },
        { model: User, as: 'issuer' },
      ],
    });

    if (!row) {
      return res.status(404).json({ success: false, message: 'Stock out not found' });
    }

    const data = {
      ...row.toJSON(),
      reference: row.referenceNo,
      location: row.location ? { id: row.location.id, name: row.location.name } : null,
      issuer: row.issuer ? { id: row.issuer.id, fullName: row.issuer.fullName } : null,
      items: (row.items || []).map((item) => ({
        ...item.toJSON(),
        product: item.product ? { id: item.product.id, name: item.product.name } : null,
      })),
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create stock out (FIFO allocation)
const createStockOut = async (req, res) => {
  try {
    const { product_id, location_id, quantity, purpose, reference, allocation_method } = req.body;

    if (!product_id || !location_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'product_id, location_id, and quantity required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
    }

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Use FIFO allocation
    const allocations = await allocateWithFIFO(product_id, location_id, quantity);

    // Calculate total cost from allocations
    const totalCost = allocations.reduce((sum, a) => sum + a.total_cost, 0);

    // Create stock out record
    const stockOut = await StockOut.create({
      referenceNo: reference || `SO-${Date.now()}`,
      recipient: purpose || 'General issue',
      locationId: location_id,
      purpose,
      userId: req.user?.id || null,
      issuedAt: new Date(),
      notes: purpose || null,
      status: 'ISSUED',
    });

    await StockOutItem.create({
      stockOutId: stockOut.id,
      productId: product_id,
      batchId: allocations[0]?.batch_id || null,
      quantity,
      price: totalCost / quantity,
      serialNumber: reference || null,
    });

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'out',
      product_id,
      from_location_id: location_id,
      to_location_id: null,
      location_id,
      quantity,
      unit_cost: totalCost / quantity,
      total_cost: totalCost,
      purpose: purpose || 'Stock out',
      reference: reference || stockOut.reference_no,
      issued_by: req.user?.id || null,
      created_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      reason: purpose || 'Stock issued',
      notes: `Stock out record created for ${product.name}`,
    });

    await syncProductQuantity(product_id);

    await createLog(
      req.user?.id,
      'StockOut',
      'create',
      stockOut.id,
      `Stock out created: ${product.name} x${quantity}`,
      { product_id, location_id, quantity, allocations },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Stock out created with FIFO allocation',
      data: {
        movement_id: movement.id,
        stock_out_id: stockOut.id,
        product: product.name,
        quantity,
        allocations,
        total_cost: totalCost,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create stock out with manual allocation
const createStockOutManual = async (req, res) => {
  try {
    const { product_id, location_id, quantity, batch_allocations, purpose, reference } = req.body;

    if (!product_id || !location_id || !batch_allocations || batch_allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'product_id, location_id, and batch_allocations required',
      });
    }

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Manual allocation
    const allocations = await allocateManual(product_id, location_id, batch_allocations);

    const totalQty = allocations.reduce((sum, a) => sum + a.quantity, 0);
    const totalCost = allocations.reduce((sum, a) => sum + a.total_cost, 0);

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'out',
      product_id,
      from_location_id: location_id,
      to_location_id: null,
      quantity: totalQty,
      unit_cost: totalCost / totalQty,
      total_cost: totalCost,
      purpose: purpose || 'Sales',
      reference: reference || null,
      issued_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      notes: 'Allocated using manual method (user selected batches)',
    });

    await syncProductQuantity(product_id);

    await createLog(
      req.user?.id,
      'StockMovement',
      'create',
      movement.id,
      `Stock out (manual): ${product.name} x${totalQty}`,
      { product_id, location_id, allocations },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Stock out created with manual allocation',
      data: {
        movement_id: movement.id,
        product: product.name,
        quantity: totalQty,
        allocations,
        total_cost: totalCost,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get available batches for manual allocation
const getAvailableBatches = async (req, res) => {
  try {
    const { product_id, location_id } = req.query;

    if (!product_id || !location_id) {
      return res.status(400).json({
        success: false,
        message: 'product_id and location_id required',
      });
    }

    const batches = await StockBatch.findAll({
      where: {
        product_id,
        location_id,
        quantity_remaining: { [Op.gt]: 0 },
      },
      order: [['received_at', 'ASC']],
      attributes: ['id', 'batch_number', 'quantity_remaining', 'unit_cost', 'unit_selling_price', 'received_at', 'condition'],
    });

    const data = batches.map(b => ({
      id: b.id,
      batch_number: b.batch_number,
      quantity_available: b.quantity_remaining,
      unit_cost: b.unit_cost,
      unit_selling_price: b.unit_selling_price,
      received_at: b.received_at,
      condition: b.condition,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Keep product inventory in sync with actual batch consumption
const syncProductQuantity = async (productId) => {
  if (!productId) return null;

  const product = await Product.findByPk(productId);
  if (!product) return null;

  const batches = await StockBatch.findAll({
    where: { product_id: productId },
    attributes: ['quantity_remaining', 'unit_cost'],
  });

  const totalAvailable = batches.reduce((sum, batch) => sum + Number(batch.quantity_remaining || 0), 0);
  const latestUnitCost = batches
    .map(batch => Number(batch.unit_cost || 0))
    .filter(value => value > 0)
    .sort((a, b) => b - a)[0];

  const priceUpdate = Number(product.price || 0) <= 0 && latestUnitCost > 0 ? { price: latestUnitCost } : {};

  await product.update({
    quantity: totalAvailable,
    ...priceUpdate,
  });

  return product;
};

module.exports = {
  listStockOut,
  getStockOut,
  createStockOut,
  createStockOutManual,
  getAvailableBatches,
  allocateWithFIFO,
  allocateManual,
  syncProductQuantity,
};

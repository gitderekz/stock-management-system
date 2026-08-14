const { StockMovement, StockBatch, Product, Location, User } = require('../models');
const { createLog } = require('./logsController');
const { sequelize } = require('../models');

// FIFO Allocation Algorithm
const allocateWithFIFO = async (productId, locationId, requestedQty) => {
  // Get all batches sorted by received_at (oldest first) - FIFO order
  const batches = await StockBatch.findAll({
    where: { 
      product_id: productId, 
      location_id: locationId,
      quantity_remaining: { [sequelize.Op.gt]: 0 } // Only non-empty batches
    },
    order: [['received_at', 'ASC']],
    attributes: ['id', 'batch_number', 'quantity_remaining', 'unit_cost', 'received_at'],
  });

  if (batches.length === 0) {
    throw new Error(`No stock available for product ${productId} at location ${locationId}`);
  }

  const allocations = [];
  let remainingQty = requestedQty;

  for (const batch of batches) {
    if (remainingQty <= 0) break;

    // How much to take from this batch
    const qtyToTake = Math.min(remainingQty, batch.quantity_remaining);

    // Record allocation
    allocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: qtyToTake,
      unit_cost: batch.unit_cost,
      total_cost: parseFloat(batch.unit_cost) * qtyToTake,
    });

    // Update batch
    await batch.update({
      quantity_remaining: batch.quantity_remaining - qtyToTake,
    });

    // Reduce requested
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

    allocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: ba.quantity,
      unit_cost: batch.unit_cost,
      total_cost: parseFloat(batch.unit_cost) * ba.quantity,
    });

    await batch.update({
      quantity_remaining: batch.quantity_remaining - ba.quantity,
    });

    totalAllocated += ba.quantity;
  }

  return allocations;
};

// List all stock movements (issues)
const listStockOut = async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      where: { type: 'out' },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'from_location', attributes: ['id', 'name'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = movements.map(m => ({
      id: m.id,
      product: m.product?.name || 'Unknown',
      quantity: m.quantity,
      location: m.from_location?.name || 'Unknown',
      purpose: m.purpose,
      reference: m.reference,
      issued_by: m.issuer?.fullName || 'System',
      issued_at: m.createdAt,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single stock out with allocations
const getStockOut = async (req, res) => {
  try {
    const movement = await StockMovement.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Location, as: 'from_location' },
        { model: User, as: 'issuer' },
      ],
    });

    if (!movement || movement.type !== 'out') {
      return res.status(404).json({ success: false, message: 'Stock out not found' });
    }

    res.json({ success: true, data: movement });
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

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'out',
      product_id,
      from_location_id: location_id,
      to_location_id: null,
      quantity,
      unit_cost: totalCost / quantity, // Average cost
      total_cost: totalCost,
      purpose: purpose || 'Sales',
      reference: reference || null,
      issued_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations), // Store allocations for traceability
      notes: allocation_method === 'FIFO' ? 'Allocated using FIFO method' : null,
    });

    await createLog(
      req.user?.id,
      'StockMovement',
      'create',
      movement.id,
      `Stock out: ${product.name} x${quantity}`,
      { product_id, location_id, quantity, allocations },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Stock out created with FIFO allocation',
      data: {
        movement_id: movement.id,
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
        quantity_remaining: { [sequelize.Op.gt]: 0 },
      },
      order: [['received_at', 'ASC']],
      attributes: ['id', 'batch_number', 'quantity_remaining', 'unit_cost', 'received_at', 'condition'],
    });

    const data = batches.map(b => ({
      id: b.id,
      batch_number: b.batch_number,
      quantity_available: b.quantity_remaining,
      unit_cost: b.unit_cost,
      received_at: b.received_at,
      condition: b.condition,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listStockOut,
  getStockOut,
  createStockOut,
  createStockOutManual,
  getAvailableBatches,
  allocateWithFIFO,
  allocateManual,
};

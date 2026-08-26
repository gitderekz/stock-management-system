const { Op } = require('sequelize');
const { StockMovement, Product, Location, User, DamagedStock, StockReturn, StockBatch, StockReturnItem } = require('../models');

const listDamagedStock = async (req, res) => {
  try {
    const rows = await DamagedStock.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: rows.map((row) => ({
      id: row.id,
      product: row.product?.name || 'Unknown',
      location: row.location?.name || 'Unknown',
      quantity: row.quantity,
      reason: row.reason,
      reported_by: row.reporter?.fullName || 'System',
      created_at: row.createdAt,
    })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listStockReturns = async (req, res) => {
  try {
    const rows = await StockReturn.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: rows.map((row) => ({
      id: row.id,
      product: row.product?.name || 'Unknown',
      location: row.location?.name || 'Unknown',
      quantity: row.quantity,
      reason: row.reason,
      created_by: row.creator?.fullName || 'System',
      created_at: row.createdAt,
    })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const { createLog } = require('./logsController');

const createMovementPayload = async (req, type, quantityOverride = null) => {
  const quantityValue = quantityOverride !== null ? quantityOverride : Number(req.body.quantity || 0);
  return {
    type,
    quantity: quantityValue,
    reason: req.body.reason || null,
    referenceNo: req.body.referenceNo || null,
    metadata: {
      items: req.body.items || [],
      supplierId: req.body.supplierId || null,
      destination: req.body.destination || null,
      sourceLocationId: req.body.sourceLocationId || null,
      destinationLocationId: req.body.destinationLocationId || null,
    },
    productId: req.body.productId || null,
    locationId: req.body.locationId || null,
    createdBy: req.user?.id || null,
  };
};

const createStockIn = async (req, res) => {
  const payload = await createMovementPayload(req, 'purchase', Number(req.body.quantity || 0));
  const movement = await StockMovement.create(payload);
  if (payload.productId) {
    await syncProductQuantity(payload.productId);
  }
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Stock in for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock received successfully', data: movement });
};

const createStockOut = async (req, res) => {
  const amount = Number(req.body.quantity || 0);
  const payload = await createMovementPayload(req, 'sale', amount > 0 ? -amount : amount);
  const movement = await StockMovement.create(payload);
  if (payload.productId) {
    await syncProductQuantity(payload.productId);
  }
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Stock out for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock issued successfully', data: movement });
};

const createTransfer = async (req, res) => {
  const totalQuantity = Number(req.body.quantity || 0);
  const payload = await createMovementPayload(req, 'transfer', totalQuantity);
  const movement = await StockMovement.create(payload);
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Transfer for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock transfer created', data: movement });
};

const createDamage = async (req, res) => {
  const amount = Number(req.body.quantity || 0);
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: 'Damage quantity must be greater than 0' });
  }

  const payload = await createMovementPayload(req, 'damage', amount > 0 ? -amount : amount);

  // Find available batches for the product at location (FIFO order)
  // If locationId is provided, only search in that location; otherwise search all locations
  const batchQuery = {
    product_id: req.body.productId,
  };
  if (req.body.locationId) {
    batchQuery.location_id = req.body.locationId;
  }

  const availableBatches = await StockBatch.findAll({
    where: batchQuery,
    order: [['received_at', 'ASC']], // FIFO: oldest first
  });

  // Auto-allocate damage quantity across available batches
  let remainingQuantity = amount;
  const batchAllocations = [];
  const damageItems = [];

  for (const batch of availableBatches) {
    if (remainingQuantity <= 0) break;

    const quantityRemaining = Number(batch.quantity_remaining || 0);
    if (quantityRemaining <= 0) continue;

    // Allocate from this batch
    const allocatedQuantity = Math.min(remainingQuantity, quantityRemaining);
    const unitCost = Number(batch.unit_cost || 0);
    const lineTotal = allocatedQuantity * unitCost;

    batchAllocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: allocatedQuantity,
      unit_cost: unitCost,
      total: lineTotal,
    });

    // Prepare DamagedStockItem data (if model exists)
    damageItems.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: allocatedQuantity,
      unit_cost: unitCost,
    });

    // Decrement batch quantity
    await batch.update({
      quantity_remaining: quantityRemaining - allocatedQuantity,
    });

    remainingQuantity -= allocatedQuantity;
  }

  if (remainingQuantity > 0) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock available. Only ${amount - remainingQuantity} of ${amount} units can be marked as damaged.`,
    });
  }

  // Create DamagedStock record
  const damageRecord = await DamagedStock.create({
    productId: req.body.productId,
    locationId: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    reason: req.body.reason || payload.reason,
    reportedBy: req.user?.id || null,
  });

  // Create StockDamagedItem records for audit trail
  if (damageItems.length > 0) {
    const { StockDamagedItem } = require('../models');
    await Promise.all(
      damageItems.map((item) =>
        StockDamagedItem.create({
          damaged_stock_id: damageRecord.id,
          product_id: req.body.productId,
          batch_id: item.batch_id,
          batch_number: item.batch_number,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })
      )
    );
  } else {
    // If no batch allocations found but quantity was specified, create a single damage item
    const { StockDamagedItem } = require('../models');
    await StockDamagedItem.create({
      damaged_stock_id: damageRecord.id,
      product_id: req.body.productId,
      batch_id: null,
      quantity: Math.abs(amount),
      unit_cost: 0,
    });
  }

  // Create StockMovement record with batch allocations
  const movement = await StockMovement.create({
    type: 'damage',
    product_id: req.body.productId,
    from_location_id: req.body.locationId || payload.locationId,
    to_location_id: null,
    location_id: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    unit_cost: 0,
    total_cost: 0,
    purpose: 'Damage',
    reference: req.body.referenceNo || null,
    issued_by: req.user?.id || null,
    created_by: req.user?.id || null,
    batch_allocations: JSON.stringify(batchAllocations),
    reason: req.body.reason || payload.reason,
    notes: `Damaged stock recorded with ${batchAllocations.length} batch allocation(s)`,
  });

  // Sync product quantity based on updated batches
  if (req.body.productId) {
    await syncProductQuantity(req.body.productId);
  }

  try {
    await createLog(
      req.user?.id || null,
      'DamagedStock',
      'create',
      damageRecord.id,
      `Damage recorded for product ${req.body.productId}: ${amount} units via ${batchAllocations.length} batch(es)`,
      JSON.stringify({ batchAllocations, payload }),
      req.ip
    );
  } catch (e) {}

  res.status(201).json({
    success: true,
    message: 'Damaged stock recorded with batch tracking',
    data: { movement, damageRecord, batchAllocations },
  });
};

const createReturn = async (req, res) => {
  const amount = Number(req.body.quantity || 0);
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: 'Return quantity must be greater than 0' });
  }

  const payload = await createMovementPayload(req, 'return', amount);

  // Find available batches for the product (FIFO order)
  // If locationId is provided, only search in that location; otherwise search all locations
  const batchQuery = {
    product_id: req.body.productId,
  };
  if (req.body.locationId) {
    batchQuery.location_id = req.body.locationId;
  }

  const availableBatches = await StockBatch.findAll({
    where: batchQuery,
    order: [['received_at', 'ASC']], // FIFO: oldest first
  });

  // Auto-allocate return quantity across available batches
  let remainingQuantity = amount;
  const batchAllocations = [];
  const returnItems = [];

  for (const batch of availableBatches) {
    if (remainingQuantity <= 0) break;

    const quantityRemaining = Number(batch.quantity_remaining || 0);
    if (quantityRemaining <= 0) continue;

    // Allocate from this batch
    const allocatedQuantity = Math.min(remainingQuantity, quantityRemaining);
    const unitCost = Number(batch.unit_cost || 0);
    const lineTotal = allocatedQuantity * unitCost;

    batchAllocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: allocatedQuantity,
      unit_cost: unitCost,
      total: lineTotal,
    });

    // Prepare StockReturnItem data
    returnItems.push({
      stock_return_id: null, // Will be set after StockReturn creation
      product_id: req.body.productId, // Include product_id
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: allocatedQuantity,
      unit_price: unitCost,
      unit_selling_price: batch.unit_selling_price || unitCost,
    });

    // Decrement batch quantity
    await batch.update({
      quantity_remaining: quantityRemaining - allocatedQuantity,
    });

    remainingQuantity -= allocatedQuantity;
  }

  if (remainingQuantity > 0) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock available. Only ${amount - remainingQuantity} of ${amount} units can be returned.`,
    });
  }

  // Create StockReturn record
  const returnRecord = await StockReturn.create({
    product_id: req.body.productId,
    location_id: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    reason: req.body.reason || payload.reason,
    created_by: req.user?.id || null,
  });

  // Create StockReturnItem records for audit trail
  if (returnItems.length > 0) {
    await Promise.all(
      returnItems.map((item) =>
        StockReturnItem.create({
          stock_return_id: returnRecord.id,
          product_id: req.body.productId, // Ensure product_id is always set
          batch_id: item.batch_id,
          batch_number: item.batch_number,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_selling_price: item.unit_selling_price,
        })
      )
    );
  } else {
    // If no batch allocations found but quantity was specified, create a single return item
    await StockReturnItem.create({
      stock_return_id: returnRecord.id,
      product_id: req.body.productId,
      batch_id: null,
      quantity: Math.abs(amount),
      unit_price: 0,
      unit_selling_price: 0,
    });
  }

  // Create StockMovement record with batch allocations
  const movement = await StockMovement.create({
    type: 'return',
    product_id: req.body.productId,
    from_location_id: req.body.locationId || payload.locationId,
    to_location_id: null,
    location_id: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    unit_cost: 0,
    total_cost: 0,
    purpose: 'Return',
    reference: req.body.referenceNo || null,
    issued_by: req.user?.id || null,
    created_by: req.user?.id || null,
    batch_allocations: JSON.stringify(batchAllocations),
    reason: req.body.reason || payload.reason,
    notes: `Return recorded with ${batchAllocations.length} batch allocation(s)`,
  });

  // Sync product quantity based on updated batches
  if (req.body.productId) {
    await syncProductQuantity(req.body.productId);
  }

  try {
    await createLog(
      req.user?.id || null,
      'StockReturn',
      'create',
      returnRecord.id,
      `Return recorded for product ${req.body.productId}: ${amount} units via ${batchAllocations.length} batch(es)`,
      JSON.stringify({ batchAllocations, payload }),
      req.ip
    );
  } catch (e) {}

  res.status(201).json({
    success: true,
    message: 'Stock return recorded with batch tracking',
    data: { movement, returnRecord, batchAllocations },
  });
};

const listMovements = async (req, res) => {
  const movements = await StockMovement.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      { model: Product, as: 'product', attributes: ['id', 'name'] },
      { model: Location, as: 'from_location', attributes: ['id', 'name'] },
      { model: Location, as: 'to_location', attributes: ['id', 'name'] },
      { model: User, as: 'issuer', attributes: ['id', 'fullName', 'email'] },
    ],
  });

  const data = movements.map((movement) => ({
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    referenceNo: movement.referenceNo,
    metadata: movement.metadata,
    product: movement.product?.name || null,
    location: movement.from_location?.name || movement.to_location?.name || null,
    user: movement.issuer?.fullName || null,
    createdAt: movement.createdAt,
  }));

  res.json({ success: true, data });
};

const syncProductQuantity = async (productId) => {
  if (!productId) return null;

  const product = await Product.findByPk(productId);
  if (!product) return null;

  const stockBatches = await require('../models').StockBatch.findAll({
    where: { product_id: productId },
    attributes: ['quantity_remaining'],
  });

  const totalAvailable = stockBatches.reduce((sum, batch) => sum + Number(batch.quantity_remaining || 0), 0);
  await product.update({ quantity: totalAvailable });
  return product;
};

module.exports = {
  createStockIn,
  createStockOut,
  createTransfer,
  createDamage,
  createReturn,
  listMovements,
  listDamagedStock,
  listStockReturns,
  syncProductQuantity,
};

const { Op } = require('sequelize');
const { StockMovement, Product, Location, User, DamagedStock, StockReturn } = require('../models');

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
  const payload = await createMovementPayload(req, 'damage', amount > 0 ? -amount : amount);

  const damageRecord = await DamagedStock.create({
    productId: req.body.productId,
    locationId: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    reason: req.body.reason || payload.reason,
    reportedBy: req.user?.id || null,
  });

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
    batch_allocations: null,
    reason: req.body.reason || payload.reason,
    notes: 'Damaged stock recorded',
  });

  if (req.body.productId) {
    await syncProductQuantity(req.body.productId);
  }
  try { await createLog(req.user?.id || null, 'DamagedStock', 'create', damageRecord.id, `Damage recorded for product ${req.body.productId}: ${amount}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Damaged stock recorded', data: { movement, damageRecord } });
};

const createReturn = async (req, res) => {
  const amount = Number(req.body.quantity || 0);
  const payload = await createMovementPayload(req, 'return', amount);

  const returnRecord = await StockReturn.create({
    product_id: req.body.productId,
    location_id: req.body.locationId || payload.locationId,
    quantity: Math.abs(amount),
    reason: req.body.reason || payload.reason,
    created_by: req.user?.id || null,
  });

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
    batch_allocations: null,
    reason: req.body.reason || payload.reason,
    notes: 'Return recorded',
  });

  if (req.body.productId) {
    await syncProductQuantity(req.body.productId);
  }
  try { await createLog(req.user?.id || null, 'StockReturn', 'create', returnRecord.id, `Return recorded for product ${req.body.productId}: ${amount}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock return recorded', data: { movement, returnRecord } });
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

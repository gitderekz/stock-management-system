const { Op } = require('sequelize');
const { StockMovement, Product, Location, User } = require('../models');
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
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Stock in for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock received successfully', data: movement });
};

const createStockOut = async (req, res) => {
  const amount = Number(req.body.quantity || 0);
  const payload = await createMovementPayload(req, 'sale', amount > 0 ? -amount : amount);
  const movement = await StockMovement.create(payload);
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
  const movement = await StockMovement.create(payload);
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Damage recorded for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Damaged stock recorded', data: movement });
};

const createReturn = async (req, res) => {
  const payload = await createMovementPayload(req, 'return', Number(req.body.quantity || 0));
  const movement = await StockMovement.create(payload);
  try { await createLog(req.user?.id || null, 'StockMovement', 'create', movement.id, `Return recorded for product ${payload.productId}: ${payload.quantity}`, JSON.stringify(payload), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Stock return recorded', data: movement });
};

const listMovements = async (req, res) => {
  const movements = await StockMovement.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      { model: Product, as: 'product', attributes: ['id', 'name'] },
      { model: Location, as: 'location', attributes: ['id', 'name'] },
      { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] },
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
    location: movement.location?.name || null,
    user: movement.creator?.fullName || null,
    createdAt: movement.createdAt,
  }));

  res.json({ success: true, data });
};

module.exports = {
  createStockIn,
  createStockOut,
  createTransfer,
  createDamage,
  createReturn,
  listMovements,
};

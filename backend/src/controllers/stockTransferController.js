const { Op } = require('sequelize');
const { StockMovement, StockBatch, Product, Location, User, StockTransfer, StockTransferItem } = require('../models');
const { createLog } = require('./logsController');

// List all stock transfers from stock_transfers table
const listStockTransfers = async (req, res) => {
  try {
    const rows = await require('../models').StockTransfer.findAll({
      include: [
        { model: require('../models').StockTransferItem, as: 'items', include: [{ model: require('../models').Product, as: 'product', attributes: ['id', 'name'] }] },
        { model: require('../models').Location, as: 'source_location', attributes: ['id', 'name'] },
        { model: require('../models').Location, as: 'destination_location', attributes: ['id', 'name'] },
        { model: require('../models').User, as: 'requestedByUser', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = rows.map((row) => ({
      id: row.id,
      reference: row.reference_no,
      product: row.items?.[0]?.product?.name || 'Unknown',
      quantity: row.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
      from_location: row.source_location?.name || 'Unknown',
      to_location: row.destination_location?.name || 'Unknown',
      transferred_by: row.requestedByUser?.fullName || 'System',
      transferred_at: row.createdAt,
      status: row.status,
      notes: row.notes,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single transfer from stock_transfers table
const getStockTransfer = async (req, res) => {
  try {
    const row = await require('../models').StockTransfer.findByPk(req.params.id, {
      include: [
        { model: require('../models').StockTransferItem, as: 'items', include: [{ model: require('../models').Product, as: 'product' }] },
        { model: require('../models').Location, as: 'source_location' },
        { model: require('../models').Location, as: 'destination_location' },
        { model: require('../models').User, as: 'requestedByUser' },
      ],
    });

    if (!row) {
      return res.status(404).json({ success: false, message: 'Stock transfer not found' });
    }

    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Transfer stock using FIFO allocation
const createTransferFIFO = async (req, res) => {
  try {
    const {
      product_id,
      productId,
      from_location_id,
      fromLocationId,
      to_location_id,
      toLocationId,
      destinationLocationId,
      sourceLocationId,
      quantity,
      reference,
      referenceNo,
    } = req.body;

    const finalProductId = product_id ?? productId;
    const finalFromLocationId = from_location_id ?? fromLocationId ?? sourceLocationId;
    const finalToLocationId = to_location_id ?? toLocationId ?? destinationLocationId;
    const finalQuantity = quantity ?? 0;
    const finalReference = reference ?? referenceNo ?? null;

    if (!finalProductId || !finalFromLocationId || !finalToLocationId || !finalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'product_id, from_location_id, to_location_id, and quantity required',
      });
    }

    if (finalQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
    }

    if (finalFromLocationId === finalToLocationId) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same location' });
    }

    const product = await Product.findByPk(finalProductId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fromLoc = await Location.findByPk(finalFromLocationId);
    if (!fromLoc) {
      return res.status(404).json({ success: false, message: 'Source location not found' });
    }

    const toLoc = await Location.findByPk(finalToLocationId);
    if (!toLoc) {
      return res.status(404).json({ success: false, message: 'Destination location not found' });
    }

    const batches = await StockBatch.findAll({
      where: {
        product_id: finalProductId,
        location_id: finalFromLocationId,
        quantity_remaining: { [Op.gt]: 0 },
      },
      order: [['received_at', 'ASC']],
    });

    if (batches.length === 0) {
      return res.status(400).json({ success: false, message: 'No stock available at source location' });
    }

    const allocations = [];
    let remainingQty = Number(finalQuantity);
    let totalCost = 0;

    for (const batch of batches) {
      if (remainingQty <= 0) break;
      const qtyToMove = Math.min(remainingQty, Number(batch.quantity_remaining || 0));
      if (qtyToMove <= 0) continue;

      allocations.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: qtyToMove,
        unit_cost: batch.unit_cost,
        total_cost: parseFloat(batch.unit_cost || 0) * qtyToMove,
      });

      totalCost += parseFloat(batch.unit_cost || 0) * qtyToMove;
      await batch.update({ quantity_remaining: Number(batch.quantity_remaining || 0) - qtyToMove });
      await StockBatch.create({
        batch_number: `${batch.batch_number}-TRANS`,
        product_id: finalProductId,
        location_id: finalToLocationId,
        quantity_received: qtyToMove,
        quantity_remaining: qtyToMove,
        unit_cost: batch.unit_cost,
        unit_selling_price: batch.unit_selling_price,
        landed_cost: batch.landed_cost,
        condition: batch.condition,
        received_at: new Date(),
        received_by: req.user?.id || null,
        notes: `Transfer from ${fromLoc.name}`,
      });
      remainingQty -= qtyToMove;
    }

    if (remainingQty > 0) {
      return res.status(400).json({ success: false, message: `Insufficient inventory: requested ${finalQuantity}, available ${Number(finalQuantity) - remainingQty}` });
    }

    const transferRecord = await StockTransfer.create({
      referenceNo: finalReference || `TR-${Date.now()}`,
      sourceLocationId: finalFromLocationId,
      destinationLocationId: finalToLocationId,
      requestedBy: req.user?.id || null,
      approvedBy: req.user?.id || null,
      status: 'COMPLETED',
      notes: 'Transferred using FIFO method',
    });

    for (const allocation of allocations) {
      await StockTransferItem.create({
        stockTransferId: transferRecord.id,
        productId: finalProductId,
        quantity: allocation.quantity,
      });
    }

    const movement = await StockMovement.create({
      type: 'transfer',
      product_id: finalProductId,
      from_location_id: finalFromLocationId,
      to_location_id: finalToLocationId,
      quantity: finalQuantity,
      unit_cost: totalCost / Number(finalQuantity),
      total_cost: totalCost,
      purpose: 'Internal Transfer',
      reference: finalReference,
      issued_by: req.user?.id || null,
      created_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      reason: 'Internal transfer',
      notes: 'Transferred using FIFO method',
    });

    await createLog(req.user?.id, 'StockTransfer', 'create', transferRecord.id, `Transfer: ${product.name} x${finalQuantity} from ${fromLoc.name} to ${toLoc.name}`, { product_id: finalProductId, from_location_id: finalFromLocationId, to_location_id: finalToLocationId, quantity: finalQuantity, allocations }, req.ip);

    res.status(201).json({ success: true, message: 'Stock transferred with FIFO allocation', data: { movement_id: movement.id, transfer_id: transferRecord.id, product: product.name, from_location: fromLoc.name, to_location: toLoc.name, quantity: finalQuantity, allocations, total_cost: totalCost } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Transfer stock with manual batch selection
const createTransferManual = async (req, res) => {
  try {
    const {
      product_id,
      productId,
      from_location_id,
      fromLocationId,
      to_location_id,
      toLocationId,
      destinationLocationId,
      sourceLocationId,
      batch_allocations,
      quantity,
      reference,
      referenceNo,
    } = req.body;

    const finalProductId = product_id ?? productId;
    const finalFromLocationId = from_location_id ?? fromLocationId ?? sourceLocationId;
    const finalToLocationId = to_location_id ?? toLocationId ?? destinationLocationId;
    const finalReference = reference ?? referenceNo ?? null;

    if (!finalProductId || !finalFromLocationId || !finalToLocationId || !batch_allocations || batch_allocations.length === 0) {
      return res.status(400).json({ success: false, message: 'product_id, from_location_id, to_location_id, and batch_allocations required' });
    }

    if (finalFromLocationId === finalToLocationId) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same location' });
    }

    const product = await Product.findByPk(finalProductId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fromLoc = await Location.findByPk(finalFromLocationId);
    if (!fromLoc) return res.status(404).json({ success: false, message: 'Source location not found' });

    const toLoc = await Location.findByPk(finalToLocationId);
    if (!toLoc) return res.status(404).json({ success: false, message: 'Destination location not found' });

    const allocations = [];
    let totalQty = 0;
    let totalCost = 0;

    for (const ba of batch_allocations) {
      const batch = await StockBatch.findByPk(ba.batch_id || ba.batchId);
      if (!batch) {
        return res.status(404).json({ success: false, message: `Batch ${ba.batch_id || ba.batchId} not found` });
      }

      const qty = Number(ba.quantity || 0);
      if (batch.quantity_remaining < qty) {
        return res.status(400).json({ success: false, message: `Batch ${batch.batch_number} has insufficient quantity` });
      }

      allocations.push({ batch_id: batch.id, batch_number: batch.batch_number, quantity: qty, unit_cost: batch.unit_cost });
      totalQty += qty;
      totalCost += parseFloat(batch.unit_cost || 0) * qty;
      await batch.update({ quantity_remaining: Number(batch.quantity_remaining || 0) - qty });
      await StockBatch.create({
        batch_number: `${batch.batch_number}-TRANS`,
        product_id: finalProductId,
        location_id: finalToLocationId,
        quantity_received: qty,
        quantity_remaining: qty,
        unit_cost: batch.unit_cost,
        unit_selling_price: batch.unit_selling_price,
        landed_cost: batch.landed_cost,
        condition: batch.condition,
        received_at: new Date(),
        received_by: req.user?.id || null,
        notes: `Transfer from ${fromLoc.name}`,
      });
    }

    const movement = await StockMovement.create({
      type: 'transfer',
      product_id: finalProductId,
      from_location_id: finalFromLocationId,
      to_location_id: finalToLocationId,
      quantity: totalQty,
      unit_cost: totalCost / totalQty,
      total_cost: totalCost,
      purpose: 'Manual Transfer',
      reference: finalReference,
      issued_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      notes: 'Transferred using manual batch selection',
    });

    await createLog(req.user?.id, 'StockMovement', 'create', movement.id, `Manual transfer: ${product.name} x${totalQty} from ${fromLoc.name} to ${toLoc.name}`, { product_id: finalProductId, from_location_id: finalFromLocationId, to_location_id: finalToLocationId, quantity: totalQty }, req.ip);

    res.status(201).json({ success: true, message: 'Transfer created', data: { movement_id: movement.id, quantity: totalQty, allocations } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listStockTransfers,
  getStockTransfer,
  createTransferFIFO,
  createTransferManual,
};

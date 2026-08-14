const { StockMovement, StockBatch, Product, Location, User } = require('../models');
const { createLog } = require('./logsController');
const { sequelize } = require('../models');

// List all stock transfers
const listStockTransfers = async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      where: { type: 'transfer' },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'from_location', attributes: ['id', 'name'] },
        { model: Location, as: 'to_location', attributes: ['id', 'name'] },
        { model: User, as: 'issuer', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = movements.map(m => ({
      id: m.id,
      product: m.product?.name || 'Unknown',
      quantity: m.quantity,
      from_location: m.from_location?.name || 'Unknown',
      to_location: m.to_location?.name || 'Unknown',
      reference: m.reference,
      transferred_by: m.issuer?.fullName || 'System',
      transferred_at: m.createdAt,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single transfer
const getStockTransfer = async (req, res) => {
  try {
    const movement = await StockMovement.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Location, as: 'from_location' },
        { model: Location, as: 'to_location' },
        { model: User, as: 'issuer' },
      ],
    });

    if (!movement || movement.type !== 'transfer') {
      return res.status(404).json({ success: false, message: 'Stock transfer not found' });
    }

    res.json({ success: true, data: movement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Transfer stock using FIFO allocation
const createTransferFIFO = async (req, res) => {
  try {
    const { product_id, from_location_id, to_location_id, quantity, reference } = req.body;

    if (!product_id || !from_location_id || !to_location_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'product_id, from_location_id, to_location_id, and quantity required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be > 0' });
    }

    // Check if same location
    if (from_location_id === to_location_id) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same location' });
    }

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check locations exist
    const fromLoc = await Location.findByPk(from_location_id);
    if (!fromLoc) {
      return res.status(404).json({ success: false, message: 'Source location not found' });
    }

    const toLoc = await Location.findByPk(to_location_id);
    if (!toLoc) {
      return res.status(404).json({ success: false, message: 'Destination location not found' });
    }

    // Get batches at source location, sorted by received_at (FIFO)
    const batches = await StockBatch.findAll({
      where: {
        product_id,
        location_id: from_location_id,
        quantity_remaining: { [sequelize.Op.gt]: 0 },
      },
      order: [['received_at', 'ASC']],
    });

    if (batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No stock of product at source location`,
      });
    }

    const allocations = [];
    let remainingQty = quantity;
    let totalCost = 0;

    // Allocate from oldest batches first (FIFO)
    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const qtyToMove = Math.min(remainingQty, batch.quantity_remaining);

      allocations.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: qtyToMove,
        unit_cost: batch.unit_cost,
        total_cost: parseFloat(batch.unit_cost) * qtyToMove,
      });

      totalCost += parseFloat(batch.unit_cost) * qtyToMove;

      // Update batch at source
      await batch.update({
        quantity_remaining: batch.quantity_remaining - qtyToMove,
      });

      // Create corresponding batch at destination
      await StockBatch.create({
        batch_number: batch.batch_number + '-TRANS',
        product_id,
        location_id: to_location_id,
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
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory: requested ${quantity}, available ${quantity - remainingQty}`,
      });
    }

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'transfer',
      product_id,
      from_location_id,
      to_location_id,
      quantity,
      unit_cost: totalCost / quantity,
      total_cost: totalCost,
      purpose: 'Internal Transfer',
      reference: reference || null,
      issued_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      notes: 'Transferred using FIFO method',
    });

    await createLog(
      req.user?.id,
      'StockMovement',
      'create',
      movement.id,
      `Transfer: ${product.name} x${quantity} from ${fromLoc.name} to ${toLoc.name}`,
      { product_id, from_location_id, to_location_id, quantity, allocations },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Stock transferred with FIFO allocation',
      data: {
        movement_id: movement.id,
        product: product.name,
        from_location: fromLoc.name,
        to_location: toLoc.name,
        quantity,
        allocations,
        total_cost: totalCost,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Transfer stock with manual batch selection
const createTransferManual = async (req, res) => {
  try {
    const { product_id, from_location_id, to_location_id, batch_allocations, reference } = req.body;

    if (!product_id || !from_location_id || !to_location_id || !batch_allocations || batch_allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'product_id, from_location_id, to_location_id, and batch_allocations required',
      });
    }

    // Check if same location
    if (from_location_id === to_location_id) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same location' });
    }

    // Check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check locations exist
    const fromLoc = await Location.findByPk(from_location_id);
    if (!fromLoc) {
      return res.status(404).json({ success: false, message: 'Source location not found' });
    }

    const toLoc = await Location.findByPk(to_location_id);
    if (!toLoc) {
      return res.status(404).json({ success: false, message: 'Destination location not found' });
    }

    const allocations = [];
    let totalQty = 0;
    let totalCost = 0;

    // Process each batch allocation
    for (const ba of batch_allocations) {
      const batch = await StockBatch.findByPk(ba.batch_id);
      if (!batch) {
        return res.status(404).json({ success: false, message: `Batch ${ba.batch_id} not found` });
      }

      if (batch.quantity_remaining < ba.quantity) {
        return res.status(400).json({
          success: false,
          message: `Batch ${batch.batch_number} has insufficient quantity: ${batch.quantity_remaining} < ${ba.quantity}`,
        });
      }

      allocations.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: ba.quantity,
        unit_cost: batch.unit_cost,
        total_cost: parseFloat(batch.unit_cost) * ba.quantity,
      });

      totalCost += parseFloat(batch.unit_cost) * ba.quantity;
      totalQty += ba.quantity;

      // Update batch at source
      await batch.update({
        quantity_remaining: batch.quantity_remaining - ba.quantity,
      });

      // Create corresponding batch at destination
      await StockBatch.create({
        batch_number: batch.batch_number + '-TRANS',
        product_id,
        location_id: to_location_id,
        quantity_received: ba.quantity,
        quantity_remaining: ba.quantity,
        unit_cost: batch.unit_cost,
        unit_selling_price: batch.unit_selling_price,
        landed_cost: batch.landed_cost,
        condition: batch.condition,
        received_at: new Date(),
        received_by: req.user?.id || null,
        notes: `Transfer from ${fromLoc.name}`,
      });
    }

    // Create stock movement record
    const movement = await StockMovement.create({
      type: 'transfer',
      product_id,
      from_location_id,
      to_location_id,
      quantity: totalQty,
      unit_cost: totalCost / totalQty,
      total_cost: totalCost,
      purpose: 'Internal Transfer',
      reference: reference || null,
      issued_by: req.user?.id || null,
      batch_allocations: JSON.stringify(allocations),
      notes: 'Transferred using manual batch selection',
    });

    await createLog(
      req.user?.id,
      'StockMovement',
      'create',
      movement.id,
      `Transfer (manual): ${product.name} x${totalQty} from ${fromLoc.name} to ${toLoc.name}`,
      { product_id, from_location_id, to_location_id, allocations },
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Stock transferred with manual batch selection',
      data: {
        movement_id: movement.id,
        product: product.name,
        from_location: fromLoc.name,
        to_location: toLoc.name,
        quantity: totalQty,
        allocations,
        total_cost: totalCost,
      },
    });
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

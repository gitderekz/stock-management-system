const { Op } = require('sequelize');
const { StockMovement, StockBatch, Product, Location, PurchaseOrder, PurchaseOrderItem, User, StockIn, StockInItem, Supplier } = require('../models');
const { createLog } = require('./logsController');
const { v4: uuidv4 } = require('uuid');

// List all stock in receipts
const listStockIn = async (req, res) => {
  try {
    const receipts = await StockIn.findAll({
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_number'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'email'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        {
          model: StockInItem,
          as: 'items',
          attributes: ['id', 'product_id', 'quantity', 'unit_price'],
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = receipts.map(r => ({
      id: r.id,
      reference_number: r.reference_no,
      purchase_order_id: r.purchase_order_id,
      purchaseOrder: r.purchaseOrder ? { id: r.purchaseOrder.id, po_number: r.purchaseOrder.po_number } : null,
      supplier: r.supplier ? { id: r.supplier.id, name: r.supplier.name } : null,
      location: r.location ? { id: r.location.id, name: r.location.name } : null,
      receiver: r.receiver ? { id: r.receiver.id, fullName: r.receiver.fullName, email: r.receiver.email } : null,
      items: r.items || [],
      items_count: (r.items || []).length,
      total_cost: Number(r.total_cost || 0),
      status: r.status,
      received_by: r.receiver?.fullName || 'System',
      received_date: r.receipt_date || r.createdAt,
      created_at: r.createdAt,
      notes: r.notes,
      location_id: r.location_id,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single stock in
const getStockIn = async (req, res) => {
  try {
    const stockIn = await StockIn.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_number', 'order_date'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'email'] },
        {
          model: StockInItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
          ],
        },
      ],
    });

    if (!stockIn) {
      return res.status(404).json({ success: false, message: 'Stock-in record not found' });
    }

    const data = {
      ...stockIn.toJSON(),
      purchased_order: stockIn.purchaseOrder ? { id: stockIn.purchaseOrder.id, po_number: stockIn.purchaseOrder.po_number } : null,
      purchaseOrder: stockIn.purchaseOrder ? { id: stockIn.purchaseOrder.id, po_number: stockIn.purchaseOrder.po_number } : null,
      location: stockIn.location ? { id: stockIn.location.id, name: stockIn.location.name } : null,
      receiver: stockIn.receiver ? { id: stockIn.receiver.id, fullName: stockIn.receiver.fullName, email: stockIn.receiver.email } : null,
      received_by: stockIn.receiver?.fullName || 'System',
      received_date: stockIn.receipt_date || stockIn.createdAt,
      items: (stockIn.items || []).map((item) => ({
        ...item.toJSON ? item.toJSON() : item,
        product: item.product ? { id: item.product.id, name: item.product.name, sku: item.product.sku } : null,
      })),
    };

    res.json({ success: true, data });
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
        unit_selling_price: i.unit_selling_price !== undefined ? parseFloat(i.unit_selling_price) : undefined,
        landed_cost: i.landed_cost !== undefined ? parseFloat(i.landed_cost) : undefined,
      }));
    } else if (po) {
      receiveList = (po.items || []).map(i => ({
        purchase_order_item_id: i.id,
        product_id: i.product_id,
        quantity_received: i.quantity,
        unit_cost: parseFloat(i.unit_cost),
        unit_selling_price: i.unit_selling_price !== undefined ? parseFloat(i.unit_selling_price) : undefined,
        landed_cost: i.landed_cost ? parseFloat(i.landed_cost) : parseFloat(i.unit_cost),
      }));
    } else {
      return res.status(400).json({ success: false, message: 'No items to receive. Provide purchase_order_id or items array.' });
    }

    const entityUserId = received_by || req.user?.id || null;
    const stockInReference = `GR-${Date.now()}`;
    const createdBatches = [];

    const stockIn = await StockIn.create({
      supplier_id: po?.supplier_id || null,
      purchase_order_id: purchase_order_id || null,
      reference_no: stockInReference,
      invoice_no: po?.po_number || null,
      location_id: location_id,
      user_id: entityUserId,
      receipt_date: new Date(),
      notes: inspection_notes || null,
      total_cost: 0,
      status: 'RECEIVED',
    });

    let stockInTotal = 0;

    for (const entry of receiveList) {
      if (!entry.product_id || !entry.quantity_received || entry.quantity_received <= 0) continue;

      const product = await Product.findByPk(entry.product_id);
      if (!product) continue; // skip missing product

      const unitCost = entry.unit_cost !== undefined ? parseFloat(entry.unit_cost) : (product.cost || 0);
      const sellingPrice = entry.unit_selling_price !== undefined ? parseFloat(entry.unit_selling_price) : (product.selling_price || product.price || 0);
      const landedCost = entry.landed_cost !== undefined ? parseFloat(entry.landed_cost) : (unitCost || 0);

      const batch_number = `${product.name.substring(0,4).toUpperCase()}-${location.name.substring(0,4).toUpperCase()}-${uuidv4().split('-')[0]}`;

      const batch = await StockBatch.create({
        batch_number,
        product_id: entry.product_id,
        location_id,
        purchase_order_id: purchase_order_id || null,
        quantity_received: parseInt(entry.quantity_received, 10),
        quantity_remaining: parseInt(entry.quantity_received, 10),
        unit_cost: unitCost,
        unit_selling_price: sellingPrice,
        landed_cost: landedCost,
        condition: 'new',
        received_at: new Date(),
        received_by: entityUserId,
        inspection_notes: inspection_notes || null,
        notes: `Received from PO ${po?.po_number || 'manual stock in'}`,
      });

      await StockInItem.create({
        stock_in_id: stockIn.id,
        product_id: entry.product_id,
        quantity: parseInt(entry.quantity_received, 10),
        unit_price: unitCost,
        condition: 'new',
        batch_no: batch.batch_number,
        warranty_information: inspection_notes || null,
      });

      stockInTotal += (unitCost || 0) * parseInt(entry.quantity_received, 10);

      const allocations = [{
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: parseInt(entry.quantity_received, 10),
        product_id: entry.product_id,
        location_id,
      }];

      await StockMovement.create({
        type: 'in',
        product_id: entry.product_id,
        from_location_id: null,
        to_location_id: location_id,
        location_id,
        quantity: parseInt(entry.quantity_received, 10),
        unit_cost: unitCost,
        total_cost: unitCost * parseInt(entry.quantity_received, 10),
        purpose: purchase_order_id ? `PO Receipt (${po.po_number})` : 'Stock In',
        reference: purchase_order_id ? po.po_number : stockInReference,
        issued_by: entityUserId,
        created_by: entityUserId,
        batch_allocations: allocations,
        reason: inspection_notes || 'Goods received from purchase order',
        notes: `Batch ${batch_number} created from receive`,
      });

      await syncProductQuantity(entry.product_id);

      createdBatches.push({ batch });

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

    await stockIn.update({ total_cost: stockInTotal, status: 'RECEIVED' });

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

    res.status(201).json({ success: true, message: 'Goods received', data: { stock_in_id: stockIn.id, batches: createdBatches.map(b => ({ id: b.batch.id, batch_number: b.batch.batch_number })) } });
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
    const { product_id, productId, location_id, locationId, include_empty } = req.query;

    const where = {};
    const finalProductId = product_id || productId;
    const finalLocationId = location_id || locationId;

    if (finalProductId) where.product_id = finalProductId;
    if (finalLocationId) where.location_id = finalLocationId;
    if (!include_empty) where.quantity_remaining = { [Op.gt]: 0 };

    const batches = await StockBatch.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_number'] },
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
        { model: PurchaseOrder, as: 'purchaseOrder' },
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
  listStockIn,
  getStockIn,
  receiveGoods,
  updateBatchDetails,
  listBatches,
  getBatchDetails,
  syncProductQuantity,
};

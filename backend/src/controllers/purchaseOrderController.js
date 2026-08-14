const { PurchaseOrder, Supplier, User, StockBatch, Product } = require('../models');
const { createLog } = require('./logsController');

// List all purchase orders
const listPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.findAll({
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        { model: StockBatch, as: 'batches' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = pos.map(po => ({
      id: po.id,
      po_number: po.po_number,
      supplier: po.supplier?.name || 'Unknown',
      po_status: po.po_status,
      payment_status: po.payment_status,
      delivery_status: po.delivery_status,
      total_amount: po.total_amount,
      total_paid: po.total_paid,
      order_date: po.order_date,
      expected_delivery: po.expected_delivery,
      actual_delivery: po.actual_delivery,
      batches_created: po.batches?.length || 0,
      created_by: po.creator?.fullName || 'System',
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
    }));

    res.json({ success: true, data, pagination: { total: data.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single PO
const getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        { model: StockBatch, as: 'batches', include: [{ model: Product, as: 'product' }] },
      ],
    });

    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    res.json({ success: true, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create PO
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, po_number, expected_delivery, notes } = req.body;

    if (!supplier_id || !po_number) {
      return res.status(400).json({ success: false, message: 'supplier_id and po_number required' });
    }

    // Check unique
    const existing = await PurchaseOrder.findOne({ where: { po_number } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'PO number already exists' });
    }

    const po = await PurchaseOrder.create({
      supplier_id,
      po_number,
      po_status: 'DRAFT',
      payment_status: 'UNPAID',
      delivery_status: 'PENDING',
      total_amount: 0,
      expected_delivery: expected_delivery || null,
      notes: notes || null,
      created_by: req.user?.id || null,
    });

    await createLog(req.user?.id, 'PurchaseOrder', 'create', po.id, `Created PO ${po_number}`, { po_number }, req.ip);

    res.status(201).json({ success: true, message: 'Purchase order created', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update PO
const updatePurchaseOrder = async (req, res) => {
  try {
    const { po_status, payment_status, delivery_status, total_amount, total_paid, expected_delivery, actual_delivery, notes } = req.body;

    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    await po.update({
      po_status: po_status || po.po_status,
      payment_status: payment_status || po.payment_status,
      delivery_status: delivery_status || po.delivery_status,
      total_amount: total_amount !== undefined ? total_amount : po.total_amount,
      total_paid: total_paid !== undefined ? total_paid : po.total_paid,
      expected_delivery: expected_delivery !== undefined ? expected_delivery : po.expected_delivery,
      actual_delivery: actual_delivery !== undefined ? actual_delivery : po.actual_delivery,
      notes: notes !== undefined ? notes : po.notes,
    });

    await createLog(req.user?.id, 'PurchaseOrder', 'update', po.id, `Updated PO ${po.po_number}`, { changes: req.body }, req.ip);

    res.json({ success: true, message: 'Purchase order updated', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete PO (only if DRAFT status)
const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    if (po.po_status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Can only delete DRAFT purchase orders' });
    }

    const poNumber = po.po_number;
    await po.destroy();

    await createLog(req.user?.id, 'PurchaseOrder', 'delete', po.id, `Deleted PO ${poNumber}`, null, req.ip);

    res.json({ success: true, message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};

const { Supplier } = require('../models');
const { createLog } = require('./logsController');

const listSuppliers = async (req, res) => {
  const suppliers = await Supplier.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: suppliers });
};

const createSupplier = async (req, res) => {
  const supplier = await Supplier.create({
    name: req.body.name,
    phone: req.body.phone || null,
    email: req.body.email || null,
    address: req.body.address || null,
  });
  try { await createLog(req.user?.id || null, 'Supplier', 'create', supplier.id, `Created supplier ${supplier.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Supplier created', data: supplier });
};

const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }
  await supplier.update({
    name: req.body.name || supplier.name,
    phone: req.body.phone !== undefined ? req.body.phone : supplier.phone,
    email: req.body.email !== undefined ? req.body.email : supplier.email,
    address: req.body.address !== undefined ? req.body.address : supplier.address,
  });
  try { await createLog(req.user?.id || null, 'Supplier', 'update', supplier.id, `Updated supplier ${supplier.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Supplier updated', data: supplier });
};

const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, message: 'Supplier not found' });
  }
  await supplier.destroy();
  try { await createLog(req.user?.id || null, 'Supplier', 'delete', supplier.id, `Deleted supplier ${supplier.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Supplier deleted' });
};

module.exports = { listSuppliers, createSupplier, updateSupplier, deleteSupplier };

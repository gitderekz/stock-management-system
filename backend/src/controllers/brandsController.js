const { Brand } = require('../models');
const { createLog } = require('./logsController');

const listBrands = async (req, res) => {
  const brands = await Brand.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: brands });
};

const createBrand = async (req, res) => {
  const brand = await Brand.create({
    name: req.body.name,
    description: req.body.description || null,
    website: req.body.website || null,
  });
  try { await createLog(req.user?.id || null, 'Brand', 'create', brand.id, `Created brand ${brand.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Brand created', data: brand });
};

const updateBrand = async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  await brand.update({
    name: req.body.name || brand.name,
    description: req.body.description !== undefined ? req.body.description : brand.description,
    website: req.body.website !== undefined ? req.body.website : brand.website,
  });
  try { await createLog(req.user?.id || null, 'Brand', 'update', brand.id, `Updated brand ${brand.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Brand updated', data: brand });
};

const deleteBrand = async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  await brand.destroy();
  try { await createLog(req.user?.id || null, 'Brand', 'delete', brand.id, `Deleted brand ${brand.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Brand deleted' });
};

module.exports = { listBrands, createBrand, updateBrand, deleteBrand };

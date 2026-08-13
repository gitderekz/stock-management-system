const { Category } = require('../models');
const { createLog } = require('./logsController');

const listCategories = async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: categories });
};

const createCategory = async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description || null,
  });
  try { await createLog(req.user?.id || null, 'Category', 'create', category.id, `Created category ${category.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

const updateCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  await category.update({
    name: req.body.name || category.name,
    description: req.body.description !== undefined ? req.body.description : category.description,
  });
  try { await createLog(req.user?.id || null, 'Category', 'update', category.id, `Updated category ${category.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Category updated', data: category });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  await category.destroy();
  try { await createLog(req.user?.id || null, 'Category', 'delete', category.id, `Deleted category ${category.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Category deleted' });
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };

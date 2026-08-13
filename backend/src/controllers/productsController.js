const { Product, Category, Brand, Supplier, ProductImage, ProductVideo } = require('../models');
const { createLog } = require('./logsController');

const ensureCategory = async (categoryId, categoryName) => {
  if (categoryId) return categoryId;
  if (!categoryName) return null;
  const [category] = await Category.findOrCreate({
    where: { name: categoryName.trim() },
    defaults: { name: categoryName.trim() },
  });
  return category.id;
};

const ensureBrand = async (brandId, brandName) => {
  if (brandId) return brandId;
  if (!brandName) return null;
  const [brand] = await Brand.findOrCreate({
    where: { name: brandName.trim() },
    defaults: { name: brandName.trim() },
  });
  return brand.id;
};

const ensureSupplier = async (supplierId, supplierName) => {
  if (supplierId) return supplierId;
  if (!supplierName) return null;
  const [supplier] = await Supplier.findOrCreate({
    where: { name: supplierName.trim() },
    defaults: { name: supplierName.trim() },
  });
  return supplier.id;
};

const serializeProduct = (product) => {
  const plain = product.get({ plain: true });
  
  // Helper to normalize file paths (remove double /uploads//)
  const buildFileUrl = (filePath) => {
    if (!filePath) return null;
    // Remove all leading slashes and /uploads prefixes
    let cleaned = filePath;
    if (cleaned.startsWith('/uploads/')) {
      cleaned = cleaned.substring(9); // Remove '/uploads/'
    } else if (cleaned.startsWith('/uploads')) {
      cleaned = cleaned.substring(8); // Remove '/uploads'
    } else if (cleaned.startsWith('/')) {
      cleaned = cleaned.substring(1); // Remove leading slash
    }
    return `/uploads/${cleaned}`;
  };

  return {
    id: plain.id,
    name: plain.name,
    description: plain.description,
    price: plain.price,
    condition: plain.condition,
    model: plain.model,
    version: plain.version,
    quantity: plain.quantity,
    serialCode: plain.serialCode,
    status: plain.status,
    imageUrl: plain.imageUrl || (plain.images && plain.images[0] ? buildFileUrl(plain.images[0].filePath) : null),
    videoUrl: plain.videoUrl || (plain.videos && plain.videos[0] ? buildFileUrl(plain.videos[0].filePath) : null),
    attachmentUrl: plain.attachmentUrl,
    categoryId: plain.categoryId,
    brandId: plain.brandId,
    supplierId: plain.supplierId,
    category: plain.category?.name || null,
    brand: plain.brand?.name || null,
    supplier: plain.supplier?.name || null,
    images: (plain.images || []).map(i => ({ id: i.id, filePath: i.filePath, fileName: i.fileName, url: buildFileUrl(i.filePath) })),
    videos: (plain.videos || []).map(v => ({ id: v.id, filePath: v.filePath, fileName: v.fileName, url: buildFileUrl(v.filePath) })),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

const listProducts = async (req, res) => {
  const products = await Product.findAll({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Brand, as: 'brand', attributes: ['id', 'name'] },
      { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
      { model: ProductImage, as: 'images' },
      { model: ProductVideo, as: 'videos' },
    ],
    order: [['createdAt', 'DESC']],
  });

  const data = products.map(serializeProduct);

  res.json({
    success: true,
    data,
    pagination: {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || data.length,
      totalItems: data.length,
      totalPages: 1,
    },
  });
};

const createProduct = async (req, res) => {
  const categoryId = await ensureCategory(req.body.categoryId, req.body.category || req.body.categoryName);
  const brandId = await ensureBrand(req.body.brandId, req.body.brand || req.body.brandName);
  const supplierId = await ensureSupplier(req.body.supplierId, req.body.supplier || req.body.supplierName);

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description || null,
    price: req.body.price || 0,
    condition: req.body.condition || 'new',
    model: req.body.model || null,
    version: req.body.version || null,
    serialCode: req.body.serialCode || null,
    quantity: req.body.quantity || 0,
    status: req.body.status || 'active',
    imageUrl: req.body.imageUrl || null,
    videoUrl: req.body.videoUrl || null,
    attachmentUrl: req.body.attachmentUrl || null,
    categoryId,
    brandId,
    supplierId,
  });

  const createdProduct = await Product.findByPk(product.id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Brand, as: 'brand', attributes: ['id', 'name'] },
      { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
      { model: ProductImage, as: 'images' },
      { model: ProductVideo, as: 'videos' },
    ],
  });

  // Audit log
  try { await createLog(req.user?.id || null, 'Product', 'create', createdProduct.id, `Created product ${createdProduct.name}`, { payload: req.body }, req.ip); } catch (e) {}

  res.status(201).json({ success: true, message: 'Product created', data: serializeProduct(createdProduct) });
};

const updateProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const categoryId = await ensureCategory(req.body.categoryId, req.body.category || req.body.categoryName);
  const brandId = await ensureBrand(req.body.brandId, req.body.brand || req.body.brandName);
  const supplierId = await ensureSupplier(req.body.supplierId, req.body.supplier || req.body.supplierName);

  await product.update({
    name: req.body.name,
    description: req.body.description || product.description,
    price: req.body.price || product.price,
    condition: req.body.condition || product.condition,
    model: req.body.model || product.model,
    version: req.body.version || product.version,
    serialCode: req.body.serialCode || product.serialCode,
    quantity: req.body.quantity || product.quantity,
    status: req.body.status || product.status,
    imageUrl: req.body.imageUrl || product.imageUrl,
    videoUrl: req.body.videoUrl || product.videoUrl,
    attachmentUrl: req.body.attachmentUrl || product.attachmentUrl,
    categoryId: categoryId !== undefined ? categoryId : product.categoryId,
    brandId: brandId !== undefined ? brandId : product.brandId,
    supplierId: supplierId !== undefined ? supplierId : product.supplierId,
  });

  const updatedProduct = await Product.findByPk(product.id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Brand, as: 'brand', attributes: ['id', 'name'] },
      { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
      { model: ProductImage, as: 'images' },
      { model: ProductVideo, as: 'videos' },
    ],
  });

  try { await createLog(req.user?.id || null, 'Product', 'update', updatedProduct.id, `Updated product ${updatedProduct.name}`, { payload: req.body }, req.ip); } catch (e) {}

  res.json({ success: true, message: 'Product updated', data: serializeProduct(updatedProduct) });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  await product.destroy();
  try { await createLog(req.user?.id || null, 'Product', 'delete', product.id, `Deleted product ${product.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Product deleted' });
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

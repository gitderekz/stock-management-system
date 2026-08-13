const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Product, ProductImage, ProductVideo } = require('../models');
const { createLog } = require('./logsController');

const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname}`.replace(/\s+/g, '_');
    cb(null, unique);
  }
});

const upload = multer({ storage });

// Route handlers (use as middleware: upload.single('file'))
const uploadProductImage = async (req, res) => {
  const productId = Number(req.params.id);
  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const record = await ProductImage.create({
    productId,
    fileName: req.file.originalname,
    filePath: `products/${req.file.filename}`,
    mimeType: req.file.mimetype,
  });

  try { await createLog(req.user?.id || null, 'ProductImage', 'create', record.id, `Uploaded image ${record.fileName} for product ${productId}`, null, req.ip); } catch (e) {}

  res.json({ success: true, message: 'Image uploaded', data: { id: record.id, url: `/uploads/${record.filePath}` } });
};

const uploadProductVideo = async (req, res) => {
  const productId = Number(req.params.id);
  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const record = await ProductVideo.create({
    productId,
    fileName: req.file.originalname,
    filePath: `products/${req.file.filename}`,
    mimeType: req.file.mimetype,
  });

  try { await createLog(req.user?.id || null, 'ProductVideo', 'create', record.id, `Uploaded video ${record.fileName} for product ${productId}`, null, req.ip); } catch (e) {}

  res.json({ success: true, message: 'Video uploaded', data: { id: record.id, url: `/uploads/${record.filePath}` } });
};

module.exports = { upload, uploadProductImage, uploadProductVideo };

const { Op } = require('sequelize');
const { sequelize, Product, StockMovement } = require('../models');
const { createLog } = require('./logsController');

const getReports = async (req, res) => {
  const totalProducts = await Product.count();
  const totalStockValueRow = await Product.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.literal('price * quantity')), 'totalStockValue']],
    raw: true,
  });
  const totalStockValue = Number(totalStockValueRow.totalStockValue || 0);
  const lowStock = await Product.count({ where: { quantity: { [Op.lte]: 5 } } });
  const outOfStock = await Product.count({ where: { quantity: 0 } });
  const damaged = await StockMovement.count({ where: { type: 'damage' } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockInToday = await StockMovement.count({
    where: {
      type: 'purchase',
      createdAt: { [Op.gte]: today },
    },
  });
  const stockOutToday = await StockMovement.count({
    where: {
      type: 'sale',
      createdAt: { [Op.gte]: today },
    },
  });
  const transfersToday = await StockMovement.count({
    where: {
      type: 'transfer',
      createdAt: { [Op.gte]: today },
    },
  });
  const damagedToday = await StockMovement.count({
    where: {
      type: 'damage',
      createdAt: { [Op.gte]: today },
    },
  });

  const recentPurchases = await StockMovement.findAll({
    where: { type: 'purchase' },
    attributes: ['metadata'],
    limit: 100,
    order: [['createdAt', 'DESC']],
  });

  const purchaseMap = {};
  recentPurchases.forEach((movement) => {
    const supplierId = movement.metadata?.supplierId || movement.metadata?.supplierName || 'unknown';
    const supplierName = movement.metadata?.supplierName || `Supplier ${supplierId}`;
    if (!purchaseMap[supplierName]) {
      purchaseMap[supplierName] = 0;
    }
    purchaseMap[supplierName] += Number(movement.metadata?.amount || 0);
  });

  const purchaseBySupplier = Object.keys(purchaseMap).map((supplier) => ({ supplier, value: purchaseMap[supplier] }));

  try { await createLog(req.user?.id || null, 'Report', 'read', null, `Generated reports overview`, { params: req.query }, req.ip); } catch (e) {}

  res.json({
    success: true,
    data: {
      inventory: {
        totalProducts,
        totalStockValue,
        lowStock,
        outOfStock,
        damaged,
      },
      movements: {
        stockInToday,
        stockOutToday,
        transfersToday,
        damagedToday,
      },
      purchases: {
        totalPurchases: Object.values(purchaseMap).reduce((sum, value) => sum + value, 0),
        purchaseBySupplier,
      },
    },
  });
};

module.exports = { getReports };

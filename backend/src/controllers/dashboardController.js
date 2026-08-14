const { Op } = require('sequelize');
const { sequelize, Product, StockMovement, User } = require('../models');
const { createLog } = require('./logsController');

const getDashboard = async (req, res) => {
  const totalProducts = await Product.count();
  const stockValueRow = await Product.findOne({
    attributes: [[sequelize.fn('SUM', sequelize.literal('price * quantity')), 'totalStockValue']],
    raw: true,
  });
  const totalStockValue = Number(stockValueRow.totalStockValue || 0);
  const lowStockAlerts = await Product.count({ where: { quantity: { [Op.lte]: 5 } } });
  const damagedItems = await StockMovement.count({ where: { type: 'damage' } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const purchasesToday = await StockMovement.count({
    where: {
      type: 'purchase',
      createdAt: { [Op.gte]: today },
    },
  });
  const salesToday = await StockMovement.count({
    where: {
      type: 'sale',
      createdAt: { [Op.gte]: today },
    },
  });

  const recentMovementsRaw = await StockMovement.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [{ model: User, as: 'issuer', attributes: ['id', 'fullName'] }],
  });

  const recentMovements = recentMovementsRaw.map((movement) => ({
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    user: movement.issuer?.fullName || 'System',
    createdAt: movement.createdAt,
  }));

  res.json({
    stats: {
      totalProducts,
      totalStockValue,
      lowStockAlerts,
      monthlyRevenue: totalStockValue,
      purchasesToday,
      salesToday,
      damagedItems,
    },
    stockSegments: [
      { name: 'Available', value: totalProducts - lowStockAlerts },
      { name: 'Low Stock', value: lowStockAlerts },
      { name: 'Damaged', value: damagedItems },
      { name: 'Reserved', value: 0 },
    ],
    recentMovements,
  });
  try { await createLog(req.user?.id || null, 'Dashboard', 'read', null, 'Viewed dashboard', null, req.ip); } catch (e) {}
};

module.exports = { getDashboard };

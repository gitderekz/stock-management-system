const { Settings } = require('../models');
const { createLog } = require('./logsController');

const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      systemName: 'StockFlow Operations',
      logoUrl: '/uploads/logo.png',
      defaultColor: '#2d6cdf',
      locale: 'en',
    });
  }
  res.json({ success: true, data: settings });
};

const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    await settings.update(req.body);
  }
  try { await createLog(req.user?.id || null, 'Settings', 'update', settings.id, `Updated system settings`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Settings updated', data: settings });
};

module.exports = { getSettings, updateSettings };

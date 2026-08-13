const { Location } = require('../models');
const { createLog } = require('./logsController');

const listLocations = async (req, res) => {
  const locations = await Location.findAll({ order: [['name', 'ASC']] });
  res.json({ success: true, data: locations });
};

const createLocation = async (req, res) => {
  const location = await Location.create({
    name: req.body.name,
    code: req.body.code,
    type: req.body.type || 'warehouse',
    address: req.body.address || null,
  });
  try { await createLog(req.user?.id || null, 'Location', 'create', location.id, `Created location ${location.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.status(201).json({ success: true, message: 'Location created', data: location });
};

const updateLocation = async (req, res) => {
  const location = await Location.findByPk(req.params.id);
  if (!location) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  await location.update({
    name: req.body.name || location.name,
    code: req.body.code || location.code,
    type: req.body.type || location.type,
    address: req.body.address !== undefined ? req.body.address : location.address,
  });
  try { await createLog(req.user?.id || null, 'Location', 'update', location.id, `Updated location ${location.name}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Location updated', data: location });
};

const deleteLocation = async (req, res) => {
  const location = await Location.findByPk(req.params.id);
  if (!location) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  await location.destroy();
  try { await createLog(req.user?.id || null, 'Location', 'delete', location.id, `Deleted location ${location.name}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Location deleted' });
};

module.exports = { listLocations, createLocation, updateLocation, deleteLocation };

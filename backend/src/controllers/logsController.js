const { SystemLog, User } = require('../models');

const listLogs = async (req, res) => {
 const { entity, action, userId, days = 30 } = req.query;
  
  const where = {};
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = Number(userId);
  
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    where.createdAt = { [require('sequelize').Op.gte]: since };
  }

  const logs = await SystemLog.findAll({
    where,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }],
    limit: 500,
  });

  const data = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    message: log.message,
    user: log.user?.fullName || 'System',
    userId: log.userId,
    email: log.user?.email,
    ipAddress: log.ipAddress,
    timestamp: log.createdAt,
    details: log.details,
  }));

  res.json({ success: true, data, total: data.length });
};

// Utility function to create logs (can be called from other controllers)
const createLog = async (userId, entity, action, entityId, message, details, ipAddress) => {
  try {
    await SystemLog.create({
      userId,
      entity,
      entityId,
      action,
      message,
      details: details || null,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to create system log:', err.message);
  }
};

module.exports = { listLogs, createLog };

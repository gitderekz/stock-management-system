const { Notification, User, Role } = require('../models');
const { createLog } = require('./logsController');

const listNotifications = async (req, res) => {
  const userId = req.user?.id;
  const where = userId ? { userId } : {};
  const notifications = await Notification.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }],
    order: [['createdAt', 'DESC']],
  });
  const payload = notifications.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    type: item.type,
    seen: item.seen,
    createdAt: item.createdAt,
    user: item.user?.fullName || 'System',
    userId: item.userId,
  }));
  res.json({ success: true, data: payload });
};

// Admin-only: create and send notification
const createNotification = async (req, res) => {
  const { title, body, type, roleIds, userIds, sendToAll } = req.body;

  // Create base notification record
  const notification = await Notification.create({
    title,
    body,
    type,
    seen: false,
  });

  // If sending to all users, create notifications for each
  if (sendToAll) {
    const users = await User.findAll({ attributes: ['id'] });
    for (const user of users) {
      await Notification.create({
        title,
        body,
        type,
        seen: false,
        userId: user.id,
      });
    }
    try { await createLog(req.user?.id || null, 'Notification', 'create', notification.id, `Notification sent to all users: ${title}`, JSON.stringify(req.body), req.ip); } catch (e) {}
    return res.status(201).json({ success: true, message: 'Notification sent to all users', data: notification });
  }

  // Send to specific roles
  if (roleIds && roleIds.length > 0) {
    const users = await User.findAll({ where: { roleId: roleIds } });
    for (const user of users) {
      await Notification.create({
        title,
        body,
        type,
        seen: false,
        userId: user.id,
      });
    }
    try { await createLog(req.user?.id || null, 'Notification', 'create', notification.id, `Notification sent to roles: ${roleIds.join(',')}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  }

  // Send to specific users
  if (userIds && userIds.length > 0) {
    for (const userId of userIds) {
      await Notification.create({
        title,
        body,
        type,
        seen: false,
        userId,
      });
    }
    try { await createLog(req.user?.id || null, 'Notification', 'create', notification.id, `Notification sent to users: ${userIds.join(',')}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  }

  res.status(201).json({ success: true, message: 'Notification created and sent', data: notification });
};

// Admin-only: update notification
const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { title, body, type } = req.body;

  const notification = await Notification.findByPk(id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  await notification.update({ title: title || notification.title, body: body || notification.body, type: type || notification.type });
  try { await createLog(req.user?.id || null, 'Notification', 'update', notification.id, `Notification updated: ${notification.title}`, JSON.stringify(req.body), req.ip); } catch (e) {}
  res.json({ success: true, message: 'Notification updated', data: notification });
};

// Admin-only: delete notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  await notification.destroy();
  try { await createLog(req.user?.id || null, 'Notification', 'delete', notification.id, `Notification deleted: ${notification.title}`, null, req.ip); } catch (e) {}
  res.json({ success: true, message: 'Notification deleted' });
};

// Mark notification as seen by current user
const markAsSeen = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const notification = await Notification.findOne({ where: { id, userId } });
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  await notification.update({ seen: true });
  res.json({ success: true, message: 'Notification marked as seen', data: notification });
};

module.exports = { listNotifications, createNotification, updateNotification, deleteNotification, markAsSeen };

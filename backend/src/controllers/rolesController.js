const { createLog } = require('./logsController');
const listRoles = async (req, res) => {
  const payload = [
    { id: 1, name: 'admin', permissions: ['*'] },
    { id: 2, name: 'stock', permissions: ['products.manage', 'stock.receive', 'stock.issue', 'stock.transfer', 'stock.adjust', 'stock.damage'] },
    { id: 3, name: 'engineer', permissions: ['products.view', 'stock.issue', 'stock.return'] },
  ];
  try { await createLog(req.user?.id || null, 'Role', 'read', null, 'Listed roles', null, req.ip); } catch (e) {}
  res.json({ success: true, data: payload });
};

const listPermissions = async (req, res) => {
  const perms = [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'stock.receive', 'stock.issue', 'stock.transfer', 'stock.adjust', 'stock.damage',
    'suppliers.view', 'reports.view', 'settings.manage', 'users.manage', 'logs.view',
  ];
  try { await createLog(req.user?.id || null, 'Permission', 'read', null, 'Listed permissions', null, req.ip); } catch (e) {}
  res.json({ success: true, data: perms });
};

module.exports = { listRoles, listPermissions };

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const permissionAliases = {
  'products.create': ['products.manage', 'products.create', 'products.update', 'products.delete'],
  'products.update': ['products.manage', 'products.create', 'products.update', 'products.delete'],
  'products.delete': ['products.manage', 'products.create', 'products.update', 'products.delete'],
  'products.view': ['products.manage', 'products.view'],
  'categories.manage': ['categories.manage'],
  'brands.manage': ['brands.manage'],
  'locations.manage': ['locations.manage'],
  'suppliers.manage': ['suppliers.manage'],
  'stock_in.manage': ['stock_in.manage', 'stock.manage', 'stock.receive'],
  'stock_out.manage': ['stock_out.manage', 'stock.manage', 'stock.issue'],
  'stock_transfer.manage': ['stock_transfer.manage', 'stock.manage', 'stock.transfer'],
  'purchase_orders.manage': ['purchase_orders.manage', 'purchase_orders.view'],
  'purchase_orders.view': ['purchase_orders.manage', 'purchase_orders.view'],
  'reports.generate': ['reports.generate', 'reports.view', 'reports.manage'],
  'reports.view': ['reports.generate', 'reports.view', 'reports.manage'],
};

const hasPermission = (requiredPermission, userPermissions = []) => {
  const normalizedUserPermissions = userPermissions.map((permission) => String(permission).trim());
  const required = String(requiredPermission).trim();

  if (!required) return true;
  if (normalizedUserPermissions.includes('*')) return true;
  if (normalizedUserPermissions.includes(required)) return true;

  const aliasSet = permissionAliases[required] || [];
  if (aliasSet.some((alias) => normalizedUserPermissions.includes(alias))) {
    return true;
  }

  const [resource, action] = required.split('.');
  if (!resource || !action) return false;

  const resourceManage = `${resource}.manage`;
  const resourceView = `${resource}.view`;
  if (normalizedUserPermissions.includes(resourceManage)) return true;
  if (action === 'view' && normalizedUserPermissions.includes(resourceView)) return true;
  if (['create', 'update', 'delete'].includes(action) && normalizedUserPermissions.includes(resourceManage)) return true;

  return false;
};

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: [{ field: 'authorization', message: 'Missing bearer token' }],
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.id || 1,
      email: decoded.email || 'support@example.com',
      role: decoded.role || 'admin',
      permissions: decoded.permissions || ['*'],
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errors: [{ field: 'token', message: error.message }],
    });
  }
};

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    const canAccess = requiredPermissions.every((permission) => hasPermission(permission, permissions));

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        errors: [{ field: 'permissions', message: 'Forbidden' }],
      });
    }

    return next();
  };
};

const requirePermission = (permission) => authorize(permission);

module.exports = {
  protect,
  authorize,
  requirePermission,
};

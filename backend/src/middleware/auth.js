const jwt = require('jsonwebtoken');
const env = require('../config/env');

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
    const hasWildcard = permissions.includes('*');

    if (hasWildcard || requiredPermissions.every((permission) => permissions.includes(permission))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
      errors: [{ field: 'permissions', message: 'Forbidden' }],
    });
  };
};

const requirePermission = (permission) => authorize(permission);

module.exports = {
  protect,
  authorize,
  requirePermission,
};

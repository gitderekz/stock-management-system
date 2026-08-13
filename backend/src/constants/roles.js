const ROLES = {
  admin: {
    permissions: ['*'],
  },
  engineer: {
    permissions: ['products.view', 'stock.view', 'stock.issue', 'stock.return', 'stock.damage', 'projects.view', 'projects.issue'],
  },
  finance: {
    permissions: ['products.view', 'suppliers.view', 'stock.view', 'reports.view', 'purchases.view'],
  },
  manager: {
    permissions: ['products.view', 'stock.view', 'stock.receive', 'stock.issue', 'stock.transfer', 'stock.damage', 'reports.view', 'users.view', 'projects.view'],
  },
  reception: {
    permissions: ['products.view', 'stock.view', 'stock.receive', 'projects.view'],
  },
  hr: {
    permissions: ['users.view', 'users.manage', 'employees.view'],
  },
  'project-manager': {
    permissions: ['projects.manage', 'projects.view', 'stock.issue', 'stock.transfer', 'stock.view', 'reports.view'],
  },
  stock: {
    permissions: ['products.manage', 'products.view', 'stock.receive', 'stock.issue', 'stock.transfer', 'stock.adjust', 'stock.damage', 'stock.view', 'stock.movements.view', 'suppliers.manage', 'locations.manage', 'brands.manage', 'categories.manage'],
  },
};

module.exports = { ROLES };

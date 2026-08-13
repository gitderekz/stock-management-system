module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      'products.view', 'products.create', 'products.update', 'products.delete', 'products.manage',
      'stock.receive', 'stock.issue', 'stock.transfer', 'stock.adjust', 'stock.damage', 'stock.return', 'stock.view', 'stock.movements.view',
      'suppliers.view', 'suppliers.manage', 'categories.manage', 'brands.manage', 'locations.manage',
      'reports.view', 'users.manage', 'users.view', 'settings.manage', 'logs.view', 'projects.manage', 'projects.view', 'employees.view'
    ];

    const rows = permissions.map((permission) => ({
      name: permission,
      description: permission,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('permissions', rows);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};

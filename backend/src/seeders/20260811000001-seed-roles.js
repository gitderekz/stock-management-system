module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { name: 'admin', description: 'Full system access', createdAt: new Date(), updatedAt: new Date() },
      { name: 'engineer', description: 'Field and consumption operations', createdAt: new Date(), updatedAt: new Date() },
      { name: 'finance', description: 'Finance and purchase visibility', createdAt: new Date(), updatedAt: new Date() },
      { name: 'manager', description: 'Management and approvals', createdAt: new Date(), updatedAt: new Date() },
      { name: 'reception', description: 'Reception and intake workflows', createdAt: new Date(), updatedAt: new Date() },
      { name: 'hr', description: 'Employee-oriented management', createdAt: new Date(), updatedAt: new Date() },
      { name: 'project-manager', description: 'Projects and assignable stock operations', createdAt: new Date(), updatedAt: new Date() },
      { name: 'stock', description: 'Inventory management and stock operations', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};

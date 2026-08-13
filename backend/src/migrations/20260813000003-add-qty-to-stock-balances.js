module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('stock_balances', 'quantity', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn('stock_balances', 'available_quantity', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn('stock_balances', 'reserved_quantity', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('stock_balances', 'reserved_quantity');
    await queryInterface.removeColumn('stock_balances', 'available_quantity');
    await queryInterface.removeColumn('stock_balances', 'quantity');
  },
};

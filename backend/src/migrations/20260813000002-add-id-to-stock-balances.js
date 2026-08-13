module.exports = {
  async up(queryInterface, Sequelize) {
    // Add an auto-increment id primary key to stock_balances to match the model
    await queryInterface.addColumn('stock_balances', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('stock_balances', 'id');
  },
};

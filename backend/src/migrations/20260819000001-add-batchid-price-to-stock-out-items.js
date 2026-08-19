module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('stock_out_items');

    if (!tableInfo.batchId) {
      await queryInterface.addColumn('stock_out_items', 'batchId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo.price) {
      await queryInterface.addColumn('stock_out_items', 'price', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('stock_out_items');

    if (tableInfo.price) {
      await queryInterface.removeColumn('stock_out_items', 'price');
    }

    if (tableInfo.batchId) {
      await queryInterface.removeColumn('stock_out_items', 'batchId');
    }
  },
};

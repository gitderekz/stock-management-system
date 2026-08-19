module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('stock_movements');

    const addIfMissing = async (col, definition) => {
      if (!tableInfo[col]) {
        await queryInterface.addColumn('stock_movements', col, definition);
      }
    };

    await addIfMissing('stock_in_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('stock_out_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('stock_transfer_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('stock_return_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('damaged_stock_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('stock_batch_id', { type: Sequelize.INTEGER, allowNull: true });
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('stock_movements');
    if (tableInfo.stock_batch_id) await queryInterface.removeColumn('stock_movements', 'stock_batch_id');
    if (tableInfo.damaged_stock_id) await queryInterface.removeColumn('stock_movements', 'damaged_stock_id');
    if (tableInfo.stock_return_id) await queryInterface.removeColumn('stock_movements', 'stock_return_id');
    if (tableInfo.stock_transfer_id) await queryInterface.removeColumn('stock_movements', 'stock_transfer_id');
    if (tableInfo.stock_out_id) await queryInterface.removeColumn('stock_movements', 'stock_out_id');
    if (tableInfo.stock_in_id) await queryInterface.removeColumn('stock_movements', 'stock_in_id');
  },
};

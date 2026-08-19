module.exports = {
  async up(queryInterface, Sequelize) {
    const stockReturnItemsExists = await queryInterface.tableExists('stock_return_items');
    if (!stockReturnItemsExists) {
      await queryInterface.createTable('stock_return_items', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        stock_return_id: { type: Sequelize.INTEGER, allowNull: false },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        batchId: { type: Sequelize.INTEGER, allowNull: true },
        batch_no: { type: Sequelize.STRING(160), allowNull: true },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
        unit_selling_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }

    const stockDamagedItemsExists = await queryInterface.tableExists('stock_damaged_items');
    if (!stockDamagedItemsExists) {
      await queryInterface.createTable('stock_damaged_items', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        damaged_stock_id: { type: Sequelize.INTEGER, allowNull: false },
        product_id: { type: Sequelize.INTEGER, allowNull: false },
        batchId: { type: Sequelize.INTEGER, allowNull: true },
        batch_no: { type: Sequelize.STRING(160), allowNull: true },
        quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
        unit_selling_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
    }
  },

  async down(queryInterface) {
    const stockReturnItemsExists = await queryInterface.tableExists('stock_return_items');
    if (stockReturnItemsExists) {
      await queryInterface.dropTable('stock_return_items');
    }

    const stockDamagedItemsExists = await queryInterface.tableExists('stock_damaged_items');
    if (stockDamagedItemsExists) {
      await queryInterface.dropTable('stock_damaged_items');
    }
  },
};

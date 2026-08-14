'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('stock_batches').catch(() => null);
    
    if (!tableInfo) {
      await queryInterface.createTable('stock_batches', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onDelete: 'CASCADE',
        },
        location_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'locations', key: 'id' },
          onDelete: 'CASCADE',
        },
        batch_number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        quantity_received: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        quantity_remaining: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        unit_cost: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },
        unit_selling_price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },
        landed_cost: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          comment: 'Unit cost including shipping, tariff, insurance',
        },
        purchase_order_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'purchase_orders', key: 'id' },
          onDelete: 'SET NULL',
        },
        received_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        condition: {
          type: Sequelize.ENUM('new', 'used', 'refurbished', 'damaged'),
          defaultValue: 'new',
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('stock_batches').catch(() => {});
  },
};

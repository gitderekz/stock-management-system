'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('purchase_orders').catch(() => null);
    
    if (!tableInfo) {
      await queryInterface.createTable('purchase_orders', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        po_number: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        supplier_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'suppliers', key: 'id' },
          onDelete: 'RESTRICT',
        },
        po_status: {
          type: Sequelize.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED'),
          defaultValue: 'DRAFT',
        },
        payment_status: {
          type: Sequelize.ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'),
          defaultValue: 'UNPAID',
        },
        delivery_status: {
          type: Sequelize.ENUM('PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'OVERDUE', 'CANCELLED'),
          defaultValue: 'PENDING',
        },
        total_amount: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_paid: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        order_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        expected_delivery: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        actual_delivery: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL',
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
    await queryInterface.dropTable('purchase_orders').catch(() => {});
  },
};

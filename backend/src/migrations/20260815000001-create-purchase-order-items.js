const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    try {
      // Create purchase_order_items table
      await queryInterface.createTable('purchase_order_items', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        purchase_order_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'purchase_orders',
            key: 'id',
          },
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        unit_cost: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        unit_selling_price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: true,
        },
        shipping_per_unit: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
        },
        tariff_per_unit: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
        },
        tax_per_unit: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
        },
        landed_cost: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: true,
        },
        total_cost: {
          type: DataTypes.DECIMAL(14, 2),
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      });

      console.log('Migration: Created purchase_order_items table');
    } catch (error) {
      console.log(`Skipping migration due to error (may already be applied): ${error.message}`);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('purchase_order_items');
      console.log('Migration: Dropped purchase_order_items table');
    } catch (error) {
      console.log(`Error dropping table: ${error.message}`);
    }
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('stock_movements').catch(() => null);
      
      if (columns) {
        // Add columns if they don't exist
        if (!columns.product_id) {
          await queryInterface.addColumn('stock_movements', 'product_id', {
            type: Sequelize.INTEGER,
            references: { model: 'products', key: 'id' },
            allowNull: true,
          });
        }

        if (!columns.from_location_id) {
          await queryInterface.addColumn('stock_movements', 'from_location_id', {
            type: Sequelize.INTEGER,
            references: { model: 'locations', key: 'id' },
            allowNull: true,
          });
        }

        if (!columns.to_location_id) {
          await queryInterface.addColumn('stock_movements', 'to_location_id', {
            type: Sequelize.INTEGER,
            references: { model: 'locations', key: 'id' },
            allowNull: true,
          });
        }

        if (!columns.unit_cost) {
          await queryInterface.addColumn('stock_movements', 'unit_cost', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0,
          });
        }

        if (!columns.total_cost) {
          await queryInterface.addColumn('stock_movements', 'total_cost', {
            type: Sequelize.DECIMAL(14, 2),
            allowNull: true,
            defaultValue: 0,
          });
        }

        if (!columns.purpose) {
          await queryInterface.addColumn('stock_movements', 'purpose', {
            type: Sequelize.STRING(255),
            allowNull: true,
          });
        }

        if (!columns.reference) {
          await queryInterface.addColumn('stock_movements', 'reference', {
            type: Sequelize.STRING(120),
            allowNull: true,
          });
        }

        if (!columns.issued_by) {
          await queryInterface.addColumn('stock_movements', 'issued_by', {
            type: Sequelize.INTEGER,
            references: { model: 'users', key: 'id' },
            allowNull: true,
          });
        }

        if (!columns.batch_allocations) {
          await queryInterface.addColumn('stock_movements', 'batch_allocations', {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: null,
          });
        }

        if (!columns.notes) {
          await queryInterface.addColumn('stock_movements', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true,
          });
        }
      }

      console.log('Applied: 20260814000003-update-stock-movements.js');
    } catch (error) {
      console.error('Migration error:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('stock_movements').catch(() => null);
      
      if (columns) {
        const columnsToRemove = [
          'product_id', 'from_location_id', 'to_location_id', 
          'unit_cost', 'total_cost', 'purpose', 'reference', 
          'issued_by', 'batch_allocations', 'notes'
        ];

        for (const col of columnsToRemove) {
          if (columns[col]) {
            await queryInterface.removeColumn('stock_movements', col).catch(() => null);
          }
        }
      }

      console.log('Rolled back: 20260814000003-update-stock-movements.js');
    } catch (error) {
      console.error('Rollback error:', error.message);
    }
  }
};

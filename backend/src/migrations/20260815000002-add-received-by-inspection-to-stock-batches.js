'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('stock_batches').catch(() => null);
    
    if (table && !table.received_by) {
      await queryInterface.addColumn('stock_batches', 'received_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      });
      console.log('✓ Added received_by column to stock_batches');
    }

    if (table && !table.inspection_notes) {
      await queryInterface.addColumn('stock_batches', 'inspection_notes', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
      console.log('✓ Added inspection_notes column to stock_batches');
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('stock_batches').catch(() => null);
    
    if (table && table.received_by) {
      await queryInterface.removeColumn('stock_batches', 'received_by');
    }
    if (table && table.inspection_notes) {
      await queryInterface.removeColumn('stock_batches', 'inspection_notes');
    }
  },
};

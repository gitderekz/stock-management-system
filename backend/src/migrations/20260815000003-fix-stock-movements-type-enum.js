'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify stock_movements.type ENUM to match the model
    // MySQL doesn't allow direct ENUM modification, so we must recreate the column
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE stock_movements 
        MODIFY COLUMN type ENUM('purchase', 'sale', 'damage', 'adjustment', 'transfer', 'return', 'in', 'out')
      `);
      console.log('✓ Updated stock_movements.type ENUM to match model');
    } catch (err) {
      console.warn('Could not update ENUM (may already be correct):', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback to original ENUM values
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE stock_movements 
        MODIFY COLUMN type ENUM('PURCHASE', 'SALE', 'ISSUE', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGE', 'LOSS', 'CONSUMPTION', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RECOVERY')
      `);
    } catch (err) {
      console.warn('Rollback error:', err.message);
    }
  },
};

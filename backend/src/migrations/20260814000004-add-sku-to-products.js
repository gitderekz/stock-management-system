'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('products', 'sku', {
        type: Sequelize.STRING(120),
        allowNull: true,
        defaultValue: null,
      }).catch(err => {
        if (err.message.includes('Duplicate column')) {
          console.log('Column sku already exists');
        } else {
          throw err;
        }
      });
      console.log('Migration: Added sku column to products table');
    } catch (error) {
      console.error('Migration error:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('products', 'sku');
      console.log('Migration: Removed sku column from products table');
    } catch (error) {
      console.error('Rollback error:', error.message);
    }
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns exist before adding them
    const tableInfo = await queryInterface.describeTable('system_logs');
    
    const addColumn = async (columnName, columnDefinition) => {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('system_logs', columnName, columnDefinition);
      }
    };

    await addColumn('userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await addColumn('entityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addColumn('details', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await addColumn('ipAddress', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });

    // Update action column to use ENUM if it's not already
    try {
      await queryInterface.changeColumn('system_logs', 'action', {
        type: Sequelize.ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'),
        allowNull: false,
      });
    } catch (err) {
      console.log('Action column already updated or error updating:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('system_logs');
    
    if (tableInfo.userId) await queryInterface.removeColumn('system_logs', 'userId');
    if (tableInfo.entityId) await queryInterface.removeColumn('system_logs', 'entityId');
    if (tableInfo.details) await queryInterface.removeColumn('system_logs', 'details');
    if (tableInfo.ipAddress) await queryInterface.removeColumn('system_logs', 'ipAddress');
  },
};

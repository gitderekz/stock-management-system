module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('system_logs');

    const safeAdd = async (colName, def) => {
      if (!tableInfo[colName]) {
        await queryInterface.addColumn('system_logs', colName, def);
      }
    };

    await safeAdd('user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await safeAdd('entity_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await safeAdd('details', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await safeAdd('ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('system_logs');
    if (tableInfo.user_id) await queryInterface.removeColumn('system_logs', 'user_id');
    if (tableInfo.entity_id) await queryInterface.removeColumn('system_logs', 'entity_id');
    if (tableInfo.details) await queryInterface.removeColumn('system_logs', 'details');
    if (tableInfo.ip_address) await queryInterface.removeColumn('system_logs', 'ip_address');
  }
};

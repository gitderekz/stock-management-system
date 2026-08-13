module.exports = {
  async up(queryInterface, Sequelize) {
    // add user_id column to notifications table
    await queryInterface.addColumn('notifications', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('notifications', 'user_id');
  },
};

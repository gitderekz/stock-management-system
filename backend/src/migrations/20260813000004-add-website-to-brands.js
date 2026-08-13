module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('brands', 'website', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('brands', 'website');
  },
};

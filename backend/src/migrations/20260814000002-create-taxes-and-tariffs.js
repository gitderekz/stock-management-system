'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const taxesInfo = await queryInterface.describeTable('taxes').catch(() => null);
    const tariffsInfo = await queryInterface.describeTable('tariffs').catch(() => null);
    
    if (!taxesInfo) {
      await queryInterface.createTable('taxes', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        rate: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM('VAT', 'WITHHOLDING', 'OTHER'),
          defaultValue: 'OTHER',
        },
        applicable_to: {
          type: Sequelize.JSON,
          defaultValue: ['all'],
          comment: 'Which entities this applies to',
        },
        is_inclusive: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_recoverable: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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

    if (!tariffsInfo) {
      await queryInterface.createTable('tariffs', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        rate: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
        },
        calculation_method: {
          type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'PER_UNIT'),
          defaultValue: 'PERCENTAGE',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
    await queryInterface.dropTable('taxes').catch(() => {});
    await queryInterface.dropTable('tariffs').catch(() => {});
  },
};

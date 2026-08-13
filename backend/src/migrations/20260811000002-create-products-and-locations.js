module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      code: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      type: { type: Sequelize.ENUM('warehouse', 'store', 'branch', 'site'), allowNull: false, defaultValue: 'warehouse' },
      address: { type: Sequelize.TEXT, allowNull: true },
      parentId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'locations', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      sku: { type: Sequelize.STRING(120), allowNull: true, unique: true },
      name: { type: Sequelize.STRING(160), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      categoryId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' } },
      brandId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'brands', key: 'id' } },
      supplierId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'suppliers', key: 'id' } },
      model: { type: Sequelize.STRING(120), allowNull: true },
      version: { type: Sequelize.STRING(80), allowNull: true },
      productCode: { type: Sequelize.STRING(120), allowNull: true, unique: true },
      serialNumber: { type: Sequelize.STRING(160), allowNull: true, unique: true },
      barcode: { type: Sequelize.STRING(160), allowNull: true, unique: true },
      unitOfMeasure: { type: Sequelize.STRING(80), allowNull: true },
      purchasePrice: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      sellingPrice: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      condition: { type: Sequelize.ENUM('NEW', 'USED', 'DAMAGED', 'REFURBISHED'), allowNull: false, defaultValue: 'NEW' },
      productType: { type: Sequelize.ENUM('CONSUMABLE', 'EQUIPMENT', 'SPARE_PART', 'ASSET', 'TOOL', 'OTHER'), allowNull: false, defaultValue: 'OTHER' },
      minStockLevel: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      maxStockLevel: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      reorderLevel: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      warrantyInformation: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('active', 'inactive', 'archived'), allowNull: false, defaultValue: 'active' },
      serialized: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      updatedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('product_images', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      fileName: { type: Sequelize.STRING(255), allowNull: false },
      filePath: { type: Sequelize.STRING(255), allowNull: false },
      mimeType: { type: Sequelize.STRING(120), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('product_videos', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      fileName: { type: Sequelize.STRING(255), allowNull: false },
      filePath: { type: Sequelize.STRING(255), allowNull: false },
      mimeType: { type: Sequelize.STRING(120), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_balances', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      locationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'locations', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      availableQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reservedQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_balances');
    await queryInterface.dropTable('product_videos');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('locations');
  },
};

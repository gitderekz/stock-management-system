module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_movements', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      locationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'locations', key: 'id' } },
      type: { type: Sequelize.ENUM('PURCHASE', 'SALE', 'ISSUE', 'RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGE', 'LOSS', 'CONSUMPTION', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RECOVERY'), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unitCost: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      totalCost: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      referenceNo: { type: Sequelize.STRING(120), allowNull: true },
      reason: { type: Sequelize.TEXT, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_in', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      supplierId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'suppliers', key: 'id' } },
      referenceNo: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      invoiceNo: { type: Sequelize.STRING(160), allowNull: true },
      locationId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'locations', key: 'id' } },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      receiptDate: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      totalCost: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      status: { type: Sequelize.ENUM('DRAFT', 'RECEIVED', 'PARTIAL', 'CANCELLED'), allowNull: false, defaultValue: 'DRAFT' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_in_items', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      stockInId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'stock_in', key: 'id' } },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      unitPrice: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
      condition: { type: Sequelize.STRING(40), allowNull: true },
      batchNo: { type: Sequelize.STRING(120), allowNull: true },
      warrantyInformation: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_out', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      referenceNo: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      recipient: { type: Sequelize.STRING(160), allowNull: true },
      engineerId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      projectId: { type: Sequelize.INTEGER, allowNull: true },
      locationId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'locations', key: 'id' } },
      destination: { type: Sequelize.STRING(160), allowNull: true },
      purpose: { type: Sequelize.STRING(160), allowNull: true },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      issuedAt: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('DRAFT', 'ISSUED', 'PARTIAL', 'CANCELLED'), allowNull: false, defaultValue: 'DRAFT' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_out_items', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      stockOutId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'stock_out', key: 'id' } },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      serialNumber: { type: Sequelize.STRING(160), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_transfers', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      referenceNo: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      sourceLocationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'locations', key: 'id' } },
      destinationLocationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'locations', key: 'id' } },
      requestedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      approvedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('stock_transfer_items', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      stockTransferId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'stock_transfers', key: 'id' } },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('damaged_stock', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      locationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'locations', key: 'id' } },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reason: { type: Sequelize.TEXT, allowNull: true },
      reportedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('system_logs', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      action: { type: Sequelize.STRING(160), allowNull: false },
      entity: { type: Sequelize.STRING(120), allowNull: false },
      entityId: { type: Sequelize.INTEGER, allowNull: true },
      oldValues: { type: Sequelize.TEXT, allowNull: true },
      newValues: { type: Sequelize.TEXT, allowNull: true },
      ipAddress: { type: Sequelize.STRING(80), allowNull: true },
      userAgent: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('settings', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      systemName: { type: Sequelize.STRING(160), allowNull: false, defaultValue: 'Stock Management System' },
      logoUrl: { type: Sequelize.STRING(255), allowNull: true },
      faviconUrl: { type: Sequelize.STRING(255), allowNull: true },
      defaultColor: { type: Sequelize.STRING(40), allowNull: true, defaultValue: '#2d6cdf' },
      smtpHostname: { type: Sequelize.STRING(160), allowNull: true },
      smtpEmail: { type: Sequelize.STRING(160), allowNull: true },
      smtpPort: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 465 },
      smtpUsername: { type: Sequelize.STRING(160), allowNull: true },
      smtpPassword: { type: Sequelize.STRING(160), allowNull: true },
      timezone: { type: Sequelize.STRING(80), allowNull: true, defaultValue: 'UTC' },
      defaultLanguage: { type: Sequelize.STRING(40), allowNull: true, defaultValue: 'en' },
      currency: { type: Sequelize.STRING(40), allowNull: true, defaultValue: 'TZS' },
      dateFormat: { type: Sequelize.STRING(40), allowNull: true, defaultValue: 'YYYY-MM-DD' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('attachments', {
      id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
      entityType: { type: Sequelize.STRING(80), allowNull: false },
      entityId: { type: Sequelize.INTEGER, allowNull: false },
      fileName: { type: Sequelize.STRING(255), allowNull: false },
      filePath: { type: Sequelize.STRING(255), allowNull: false },
      mimeType: { type: Sequelize.STRING(120), allowNull: true },
      fileSize: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      uploadedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
    await queryInterface.dropTable('settings');
    await queryInterface.dropTable('system_logs');
    await queryInterface.dropTable('damaged_stock');
    await queryInterface.dropTable('stock_transfer_items');
    await queryInterface.dropTable('stock_transfers');
    await queryInterface.dropTable('stock_out_items');
    await queryInterface.dropTable('stock_out');
    await queryInterface.dropTable('stock_in_items');
    await queryInterface.dropTable('stock_in');
    await queryInterface.dropTable('stock_movements');
  },
};

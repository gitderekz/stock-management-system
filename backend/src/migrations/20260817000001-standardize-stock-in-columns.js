'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const stockIn = await queryInterface.describeTable('stock_in').catch(() => null);
      if (stockIn) {
        const renameMap = {
          supplierId: 'supplier_id',
          purchaseOrderId: 'purchase_order_id',
          referenceNo: 'reference_no',
          invoiceNo: 'invoice_no',
          locationId: 'location_id',
          userId: 'user_id',
          receiptDate: 'receipt_date',
          totalCost: 'total_cost',
        };

        for (const [from, to] of Object.entries(renameMap)) {
          if (stockIn[from] && !stockIn[to]) {
            await queryInterface.renameColumn('stock_in', from, to);
          }
        }

        if (stockIn && !stockIn.purchase_order_id) {
          await queryInterface.addColumn('stock_in', 'purchase_order_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'purchase_orders', key: 'id' },
          });
        }

        if (stockIn && !stockIn.created_at) {
          await queryInterface.changeColumn('stock_in', 'createdAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
          await queryInterface.renameColumn('stock_in', 'createdAt', 'created_at');
        }

        if (stockIn && !stockIn.updated_at) {
          await queryInterface.changeColumn('stock_in', 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
          await queryInterface.renameColumn('stock_in', 'updatedAt', 'updated_at');
        }
      }

      const stockInItems = await queryInterface.describeTable('stock_in_items').catch(() => null);
      if (stockInItems) {
        const renameMap = {
          stockInId: 'stock_in_id',
          productId: 'product_id',
          unitPrice: 'unit_price',
          batchNo: 'batch_no',
          warrantyInformation: 'warranty_information',
        };

        for (const [from, to] of Object.entries(renameMap)) {
          if (stockInItems[from] && !stockInItems[to]) {
            await queryInterface.renameColumn('stock_in_items', from, to);
          }
        }

        if (stockInItems && !stockInItems.created_at) {
          await queryInterface.changeColumn('stock_in_items', 'createdAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
          await queryInterface.renameColumn('stock_in_items', 'createdAt', 'created_at');
        }

        if (stockInItems && !stockInItems.updated_at) {
          await queryInterface.changeColumn('stock_in_items', 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          });
          await queryInterface.renameColumn('stock_in_items', 'updatedAt', 'updated_at');
        }
      }
    } catch (error) {
      console.warn('stock_in column normalization skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const stockIn = await queryInterface.describeTable('stock_in').catch(() => null);
      if (stockIn) {
        const renameMap = {
          supplier_id: 'supplierId',
          purchase_order_id: 'purchaseOrderId',
          reference_no: 'referenceNo',
          invoice_no: 'invoiceNo',
          location_id: 'locationId',
          user_id: 'userId',
          receipt_date: 'receiptDate',
          total_cost: 'totalCost',
        };

        for (const [from, to] of Object.entries(renameMap)) {
          if (stockIn[from] && !stockIn[to]) {
            await queryInterface.renameColumn('stock_in', from, to);
          }
        }
      }

      const stockInItems = await queryInterface.describeTable('stock_in_items').catch(() => null);
      if (stockInItems) {
        const renameMap = {
          stock_in_id: 'stockInId',
          product_id: 'productId',
          unit_price: 'unitPrice',
          batch_no: 'batchNo',
          warranty_information: 'warrantyInformation',
        };

        for (const [from, to] of Object.entries(renameMap)) {
          if (stockInItems[from] && !stockInItems[to]) {
            await queryInterface.renameColumn('stock_in_items', from, to);
          }
        }
      }
    } catch (error) {
      console.warn('stock_in rollback skipped:', error.message);
    }
  },
};

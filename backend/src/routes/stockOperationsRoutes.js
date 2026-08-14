const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// Import controllers
const purchaseOrderController = require('../controllers/purchaseOrderController');
const stockInController = require('../controllers/stockInController');
const stockOutController = require('../controllers/stockOutController');
const stockTransferController = require('../controllers/stockTransferController');

// ===== PURCHASE ORDERS =====
router.get('/purchase-orders', authenticate, purchaseOrderController.listPurchaseOrders);
router.get('/purchase-orders/:id', authenticate, purchaseOrderController.getPurchaseOrder);
router.post('/purchase-orders', authenticate, requirePermission('purchase_orders.manage'), purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:id', authenticate, requirePermission('purchase_orders.manage'), purchaseOrderController.updatePurchaseOrder);
router.delete('/purchase-orders/:id', authenticate, requirePermission('purchase_orders.manage'), purchaseOrderController.deletePurchaseOrder);

// ===== STOCK IN (RECEIPT) =====
router.get('/stock/in', authenticate, stockInController.listStockIn);
router.get('/stock/in/:id', authenticate, stockInController.getStockIn);
router.post('/stock/in', authenticate, requirePermission('stock_in.manage'), stockInController.receiveGoods);
router.put('/stock/in/:id', authenticate, requirePermission('stock_in.manage'), stockInController.updateBatchDetails);

// ===== STOCK BATCHES =====
router.get('/stock/batches', authenticate, stockInController.listBatches);
router.get('/stock/batches/:id', authenticate, stockInController.getBatchDetails);

// ===== STOCK OUT (ISSUE) =====
router.get('/stock/out', authenticate, stockOutController.listStockOut);
router.get('/stock/out/:id', authenticate, stockOutController.getStockOut);
router.get('/stock/out/available-batches', authenticate, stockOutController.getAvailableBatches);
router.post('/stock/out', authenticate, requirePermission('stock_out.manage'), stockOutController.createStockOut);
router.post('/stock/out/manual', authenticate, requirePermission('stock_out.manage'), stockOutController.createStockOutManual);

// ===== STOCK TRANSFER =====
router.get('/stock/transfer', authenticate, stockTransferController.listStockTransfers);
router.get('/stock/transfer/:id', authenticate, stockTransferController.getStockTransfer);
router.post('/stock/transfer', authenticate, requirePermission('stock_transfer.manage'), stockTransferController.createTransferFIFO);
router.post('/stock/transfer/manual', authenticate, requirePermission('stock_transfer.manage'), stockTransferController.createTransferManual);

module.exports = router;

kali@kali-Latitude-3420:~/miradi/Stock-Management-System/backend$ npm run dev

> stock-management-system-backend@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`
Running migration runner...
Applying migration: 20240115_add_roleId_to_users.js
Skipping migration due to error (may already be applied): 20240115_add_roleId_to_users.js Duplicate column name 'roleId'
Applying migration: 20240115_enhance_system_logs.js
Action column already updated or error updating: Data truncated for column 'action' at row 1
Applied: 20240115_enhance_system_logs.js
Applying migration: 20260811000001-create-core-auth-and-catalog.js
Applied: 20260811000001-create-core-auth-and-catalog.js
Applying migration: 20260811000002-create-products-and-locations.js
Applied: 20260811000002-create-products-and-locations.js
Applying migration: 20260811000003-create-stock-operations-and-logs.js
Applied: 20260811000003-create-stock-operations-and-logs.js
Applying migration: 20260813000001-add-notifications-userid.js
Skipping migration due to error (may already be applied): 20260813000001-add-notifications-userid.js Duplicate column name 'user_id'
Applying migration: 20260813000002-add-id-to-stock-balances.js
Skipping migration due to error (may already be applied): 20260813000002-add-id-to-stock-balances.js Multiple primary key defined
Applying migration: 20260813000003-add-qty-to-stock-balances.js
Skipping migration due to error (may already be applied): 20260813000003-add-qty-to-stock-balances.js Duplicate column name 'quantity'
Applying migration: 20260813000004-add-website-to-brands.js
Skipping migration due to error (may already be applied): 20260813000004-add-website-to-brands.js Duplicate column name 'website'
Applying migration: 20260813000005-fix-system-logs-columns.js
Applied: 20260813000005-fix-system-logs-columns.js
Applying migration: 20260814000000-create-stock-batches.js
Applied: 20260814000000-create-stock-batches.js
Applying migration: 20260814000001-create-purchase-orders.js
Applied: 20260814000001-create-purchase-orders.js
Applying migration: 20260814000002-create-taxes-and-tariffs.js
Applied: 20260814000002-create-taxes-and-tariffs.js
Applying migration: 20260814000003-update-stock-movements.js
Applied: 20260814000003-update-stock-movements.js
Applied: 20260814000003-update-stock-movements.js
Applying migration: 20260814000004-add-sku-to-products.js
Column sku already exists
Migration: Added sku column to products table
Applied: 20260814000004-add-sku-to-products.js
Applying migration: 20260815000001-create-purchase-order-items.js
Migration: Created purchase_order_items table
Applied: 20260815000001-create-purchase-order-items.js
Applying migration: 20260815000002-add-received-by-inspection-to-stock-batches.js
Applied: 20260815000002-add-received-by-inspection-to-stock-batches.js
Applying migration: 20260815000003-fix-stock-movements-type-enum.js
✓ Updated stock_movements.type ENUM to match model
Applied: 20260815000003-fix-stock-movements-type-enum.js
Applying migration: 20260817000001-standardize-stock-in-columns.js
Applied: 20260817000001-standardize-stock-in-columns.js
Applying migration: 20260819000001-add-batchid-price-to-stock-out-items.js
Applied: 20260819000001-add-batchid-price-to-stock-out-items.js
Applying migration: 20260819000002-add-stock-item-detail-tables.js
Applied: 20260819000002-add-stock-item-detail-tables.js
All migrations applied
Migration runner finished.
Database connection established using Sequelize.
Sequelize model synchronization completed safely.
StockMovement seed warning for PUR-001: Unknown column 'stock_in_id' in 'field list'
StockMovement seed warning for OUT-001: Unknown column 'stock_in_id' in 'field list'
Seed data initialization completed.
Seeding Phase 2 data: Taxes, Tariffs, PurchaseOrders, StockBatches...
✓ Taxes seeded
✓ Tariffs seeded
✓ Permissions seeded and assigned
✓ Purchase Orders seeded
✓ Stock Batches seeded
Phase 2 seeding completed successfully!
Phase 2 seed data initialization completed.
Stock Management System API running on port 3000
node:internal/process/promises:391
    triggerUncaughtException(err, true /* fromPromise */);
    ^

Error
    at Query.run (/home/kali/miradi/Stock-Management-System/backend/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)
    at /home/kali/miradi/Stock-Management-System/backend/node_modules/sequelize/lib/sequelize.js:315:28
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MySQLQueryInterface.select (/home/kali/miradi/Stock-Management-System/backend/node_modules/sequelize/lib/dialects/abstract/query-interface.js:407:12)
    at async StockMovement.findAll (/home/kali/miradi/Stock-Management-System/backend/node_modules/sequelize/lib/model.js:1140:21)
    at async getDashboard (/home/kali/miradi/Stock-Management-System/backend/src/controllers/dashboardController.js:31:30) {
  name: 'SequelizeDatabaseError',
  parent: Error: Unknown column 'StockMovement.stock_in_id' in 'field list'
      at Packet.asError (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/packets/packet.js:833:17)
      at Query.execute (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/commands/command.js:29:26)
      at Connection.handlePacket (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:555:34)
      at PacketParser.onPacket (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:104:12)
      at PacketParser.executeStart (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/packet_parser.js:75:16)
      at Socket.<anonymous> (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:112:25)
      at Socket.emit (node:events:524:28)
      at addChunk (node:internal/streams/readable:561:12)
      at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
      at Readable.push (node:internal/streams/readable:392:5) {
    code: 'ER_BAD_FIELD_ERROR',
    errno: 1054,
    sqlState: '42S22',
    sqlMessage: "Unknown column 'StockMovement.stock_in_id' in 'field list'",
    sql: 'SELECT `StockMovement`.`id`, `StockMovement`.`type`, `StockMovement`.`product_id`, `StockMovement`.`from_location_id`, `StockMovement`.`to_location_id`, `StockMovement`.`location_id`, `StockMovement`.`quantity`, `StockMovement`.`unit_cost`, `StockMovement`.`total_cost`, `StockMovement`.`purpose`, `StockMovement`.`reference`, `StockMovement`.`issued_by`, `StockMovement`.`created_by`, `StockMovement`.`batch_allocations`, `StockMovement`.`reason`, `StockMovement`.`notes`, `StockMovement`.`reference_no` AS `referenceNo`, `StockMovement`.`metadata`, `StockMovement`.`created_at` AS `createdAt`, `StockMovement`.`updated_at` AS `updatedAt`, `StockMovement`.`stock_in_id`, `StockMovement`.`stock_out_id`, `StockMovement`.`stock_transfer_id`, `StockMovement`.`stock_return_id`, `StockMovement`.`damaged_stock_id`, `StockMovement`.`stock_batch_id`, `issuer`.`id` AS `issuer.id`, `issuer`.`full_name` AS `issuer.fullName` FROM `stock_movements` AS `StockMovement` LEFT OUTER JOIN `users` AS `issuer` ON `StockMovement`.`issued_by` = `issuer`.`id` ORDER BY `createdAt` DESC LIMIT 5;',
    parameters: undefined
  },
  original: Error: Unknown column 'StockMovement.stock_in_id' in 'field list'
      at Packet.asError (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/packets/packet.js:833:17)
      at Query.execute (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/commands/command.js:29:26)
      at Connection.handlePacket (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:555:34)
      at PacketParser.onPacket (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:104:12)
      at PacketParser.executeStart (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/packet_parser.js:75:16)
      at Socket.<anonymous> (/home/kali/miradi/Stock-Management-System/backend/node_modules/mysql2/lib/base/connection.js:112:25)
      at Socket.emit (node:events:524:28)
      at addChunk (node:internal/streams/readable:561:12)
      at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
      at Readable.push (node:internal/streams/readable:392:5) {
    code: 'ER_BAD_FIELD_ERROR',
    errno: 1054,
    sqlState: '42S22',
    sqlMessage: "Unknown column 'StockMovement.stock_in_id' in 'field list'",
    sql: 'SELECT `StockMovement`.`id`, `StockMovement`.`type`, `StockMovement`.`product_id`, `StockMovement`.`from_location_id`, `StockMovement`.`to_location_id`, `StockMovement`.`location_id`, `StockMovement`.`quantity`, `StockMovement`.`unit_cost`, `StockMovement`.`total_cost`, `StockMovement`.`purpose`, `StockMovement`.`reference`, `StockMovement`.`issued_by`, `StockMovement`.`created_by`, `StockMovement`.`batch_allocations`, `StockMovement`.`reason`, `StockMovement`.`notes`, `StockMovement`.`reference_no` AS `referenceNo`, `StockMovement`.`metadata`, `StockMovement`.`created_at` AS `createdAt`, `StockMovement`.`updated_at` AS `updatedAt`, `StockMovement`.`stock_in_id`, `StockMovement`.`stock_out_id`, `StockMovement`.`stock_transfer_id`, `StockMovement`.`stock_return_id`, `StockMovement`.`damaged_stock_id`, `StockMovement`.`stock_batch_id`, `issuer`.`id` AS `issuer.id`, `issuer`.`full_name` AS `issuer.fullName` FROM `stock_movements` AS `StockMovement` LEFT OUTER JOIN `users` AS `issuer` ON `StockMovement`.`issued_by` = `issuer`.`id` ORDER BY `createdAt` DESC LIMIT 5;',
    parameters: undefined
  },
  sql: 'SELECT `StockMovement`.`id`, `StockMovement`.`type`, `StockMovement`.`product_id`, `StockMovement`.`from_location_id`, `StockMovement`.`to_location_id`, `StockMovement`.`location_id`, `StockMovement`.`quantity`, `StockMovement`.`unit_cost`, `StockMovement`.`total_cost`, `StockMovement`.`purpose`, `StockMovement`.`reference`, `StockMovement`.`issued_by`, `StockMovement`.`created_by`, `StockMovement`.`batch_allocations`, `StockMovement`.`reason`, `StockMovement`.`notes`, `StockMovement`.`reference_no` AS `referenceNo`, `StockMovement`.`metadata`, `StockMovement`.`created_at` AS `createdAt`, `StockMovement`.`updated_at` AS `updatedAt`, `StockMovement`.`stock_in_id`, `StockMovement`.`stock_out_id`, `StockMovement`.`stock_transfer_id`, `StockMovement`.`stock_return_id`, `StockMovement`.`damaged_stock_id`, `StockMovement`.`stock_batch_id`, `issuer`.`id` AS `issuer.id`, `issuer`.`full_name` AS `issuer.fullName` FROM `stock_movements` AS `StockMovement` LEFT OUTER JOIN `users` AS `issuer` ON `StockMovement`.`issued_by` = `issuer`.`id` ORDER BY `createdAt` DESC LIMIT 5;',
  parameters: {}
}

Node.js v20.20.2
[nodemon] app crashed - waiting for file changes before starting...

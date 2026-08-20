There is no report showing data until now,

Learn from the below behavior and data and make all reports work perfect.
These are the request and resonse for each report

- Overview
Request URL
http://localhost:5173/api/v1/reports
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin

RESPONSE:
{
    "success": true,
    "data": {
        "inventory": {
            "totalProducts": 8,
            "totalStockValue": 41024000,
            "lowStock": 2,
            "outOfStock": 1,
            "damaged": 2
        },
        "movements": {
            "stockInToday": 0,
            "stockOutToday": 0,
            "transfersToday": 0,
            "damagedToday": 0
        },
        "purchases": {
            "totalPurchases": 0,
            "purchaseBySupplier": [
                {
                    "supplier": "Supplier unknown",
                    "value": 0
                }
            ]
        },
        "stockSegments": [
            {
                "name": "Available",
                "value": 6
            },
            {
                "name": "Low Stock",
                "value": 2
            },
            {
                "name": "Damaged",
                "value": 2
            },
            {
                "name": "Reserved",
                "value": 0
            }
        ]
    }
}

- Valuation
Request URL
http://localhost:5173/api/v1/reports/valuation?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin

RESPONSE:
{
    "success": true,
    "report_type": "stock_valuation",
    "generated_at": "2026-08-20T07:52:29.433Z",
    "summary": {
        "total_units": 187,
        "total_cost": 8568800,
        "total_landed_value": 9020200,
        "total_selling_value": 10943300,
        "gross_margin": 17.57330969634388
    },
    "data": [
        {
            "product_id": 7,
            "product_name": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "location": "Branch C",
            "batch_number": "EPP--BRAN-3a7e8075",
            "quantity": 92,
            "unit_cost": 80000,
            "landed_cost": 83800,
            "unit_selling_price": 100000,
            "total_cost": 7360000,
            "total_landed_value": 7709600,
            "total_selling_value": 9200000,
            "condition": "new",
            "received_at": "2026-08-19T05:51:44.000Z"
        },
        {
            "product_id": 6,
            "product_name": "DDR4 4GB RAM",
            "sku": "SMOKE-001",
            "location": "Branch C",
            "batch_number": "DDR4-BRAN-bed6418d",
            "quantity": 20,
            "unit_cost": 20000,
            "landed_cost": 22500,
            "unit_selling_price": 30000,
            "total_cost": 400000,
            "total_landed_value": 450000,
            "total_selling_value": 600000,
            "condition": "new",
            "received_at": "2026-08-19T05:51:44.000Z"
        },
        {
            "product_id": 1,
            "product_name": "ATM Peripheral Kit",
            "sku": "-",
            "location": "Warehouse A",
            "batch_number": "B001-AP-001",
            "quantity": 35,
            "unit_cost": 2000,
            "landed_cost": 2200,
            "unit_selling_price": 3500,
            "total_cost": 70000,
            "total_landed_value": 77000,
            "total_selling_value": 122500,
            "condition": "new",
            "received_at": "2026-08-01T00:00:00.000Z"
        },
        {
            "product_id": 1,
            "product_name": "ATM Peripheral Kit",
            "sku": "-",
            "location": "Warehouse A",
            "batch_number": "B001-AP-002",
            "quantity": 28,
            "unit_cost": 2100,
            "landed_cost": 2300,
            "unit_selling_price": 3600,
            "total_cost": 58800,
            "total_landed_value": 64400,
            "total_selling_value": 100800,
            "condition": "new",
            "received_at": "2026-08-05T00:00:00.000Z"
        },
        {
            "product_id": 2,
            "product_name": "Cash Dispense Module",
            "sku": "-",
            "location": "Warehouse A",
            "batch_number": "B002-CDM-001",
            "quantity": 8,
            "unit_cost": 45000,
            "landed_cost": 48000,
            "unit_selling_price": 65000,
            "total_cost": 360000,
            "total_landed_value": 384000,
            "total_selling_value": 520000,
            "condition": "used",
            "received_at": "2026-08-03T00:00:00.000Z"
        },
        {
            "product_id": 7,
            "product_name": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "location": "Store A",
            "batch_number": "EPP--BRAN-3a7e8075-TRANS",
            "quantity": 4,
            "unit_cost": 80000,
            "landed_cost": 83800,
            "unit_selling_price": 100000,
            "total_cost": 320000,
            "total_landed_value": 335200,
            "total_selling_value": 400000,
            "condition": "new",
            "received_at": "2026-08-19T14:27:16.000Z"
        }
    ]
}


- FIFO Cost
Request URL
http://localhost:5173/api/v1/reports/fifo-cost?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin

RESPONSE:
{
    "success": true,
    "report_type": "fifo_cost",
    "generated_at": "2026-08-20T07:53:00.761Z",
    "summary": {
        "total_movements": 3,
        "total_units_issued": 5,
        "total_cogs": 401000,
        "average_cost_per_unit": 80200
    },
    "data": [
        {
            "movement_id": 23,
            "product_name": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity_issued": 2,
            "issued_by": "Your Admin",
            "issued_at": "2026-08-19T14:23:33.000Z",
            "total_cost": 200000,
            "unit_cost": 100000,
            "reference": "REF002",
            "batch_allocations": [
                {
                    "batch_number": "—",
                    "quantity": 0,
                    "unit_cost": 0,
                    "total": 0
                }
            ]
        },
        {
            "movement_id": 22,
            "product_name": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity_issued": 2,
            "issued_by": "Your Admin",
            "issued_at": "2026-08-19T05:57:54.000Z",
            "total_cost": 200000,
            "unit_cost": 100000,
            "reference": "REF001",
            "batch_allocations": [
                {
                    "batch_number": "—",
                    "quantity": 0,
                    "unit_cost": 0,
                    "total": 0
                }
            ]
        },
        {
            "movement_id": 15,
            "product_name": "NCT Card Reader",
            "sku": "-",
            "quantity_issued": 1,
            "issued_by": "Your Admin",
            "issued_at": "2026-08-17T13:25:10.000Z",
            "total_cost": 1000,
            "unit_cost": 1000,
            "reference": "REF0001",
            "batch_allocations": [
                {
                    "batch_number": "—",
                    "quantity": 0,
                    "unit_cost": 0,
                    "total": 0
                }
            ]
        }
    ]
}

- Low Stock
Request URL
http://localhost:5173/api/v1/reports/low-stock?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "report_type": "low_stock_alert",
    "generated_at": "2026-08-20T07:53:47.380Z",
    "reorder_level": 5,
    "summary": {
        "total_alerts": 2,
        "critical_count": 2
    },
    "data": [
        {
            "product_id": 3,
            "product_name": "E2E Test Product 1786611543809",
            "sku": null,
            "recorded_quantity": 5,
            "actual_remaining": 0,
            "reorder_level": 5,
            "alert_level": "LOW",
            "batches": 0,
            "oldest_batch_date": null
        },
        {
            "product_id": 8,
            "product_name": "Wincor-Nixdorf CASH DISPENSER",
            "sku": "SMOKE-SKU-2",
            "recorded_quantity": 0,
            "actual_remaining": 0,
            "reorder_level": 5,
            "alert_level": "LOW",
            "batches": 0,
            "oldest_batch_date": null
        }
    ]
}

- Movements
Request URL
http://localhost:5173/api/v1/reports/movements-summary?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "report_type": "movements_summary",
    "generated_at": "2026-08-20T07:54:15.782Z",
    "period": {},
    "summary": {
        "total_movements": 26,
        "by_type": {
            "return": {
                "count": 2,
                "total_quantity": 5,
                "total_value": 0
            },
            "damage": {
                "count": 2,
                "total_quantity": 0,
                "total_value": 0
            },
            "transfer": {
                "count": 1,
                "total_quantity": 4,
                "total_value": 320000
            },
            "out": {
                "count": 3,
                "total_quantity": 5,
                "total_value": 401000
            },
            "in": {
                "count": 14,
                "total_quantity": 440,
                "total_value": 25430000
            },
            "purchase": {
                "count": 2,
                "total_quantity": 20,
                "total_value": 0
            },
            "sale": {
                "count": 2,
                "total_quantity": 0,
                "total_value": 0
            }
        },
        "by_product": {
            "EPP-004-Keyboard": {
                "count": 8,
                "total_quantity": 313,
                "total_value": 24720000
            },
            "DDR4 4GB RAM": {
                "count": 3,
                "total_quantity": 60,
                "total_value": 1200000
            },
            "NCT Card Reader": {
                "count": 4,
                "total_quantity": 31,
                "total_value": 31000
            },
            "abc": {
                "count": 3,
                "total_quantity": 30,
                "total_value": 180000
            },
            "Unknown": {
                "count": 2,
                "total_quantity": 0,
                "total_value": 0
            },
            "ATM Peripheral Kit": {
                "count": 4,
                "total_quantity": 40,
                "total_value": 20000
            },
            "Cash Dispense Module": {
                "count": 2,
                "total_quantity": 0,
                "total_value": 0
            }
        }
    },
    "data": [
        {
            "movement_id": 26,
            "type": "return",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 4,
            "from_location": "-",
            "to_location": "-",
            "value": 0,
            "purpose": "Return",
            "reference": null,
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T14:53:35.000Z"
        },
        {
            "movement_id": 25,
            "type": "damage",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 1,
            "from_location": "Branch C",
            "to_location": "-",
            "value": 0,
            "purpose": "Damage",
            "reference": null,
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T14:29:43.000Z"
        },
        {
            "movement_id": 24,
            "type": "transfer",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 4,
            "from_location": "Branch C",
            "to_location": "Store A",
            "value": 320000,
            "purpose": "Internal Transfer",
            "reference": "REF0001",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T14:27:16.000Z"
        },
        {
            "movement_id": 23,
            "type": "out",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 2,
            "from_location": "Branch C",
            "to_location": "-",
            "value": 200000,
            "purpose": "sale",
            "reference": "REF002",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T14:23:33.000Z"
        },
        {
            "movement_id": 22,
            "type": "out",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 2,
            "from_location": "Branch C",
            "to_location": "-",
            "value": 200000,
            "purpose": "sale",
            "reference": "REF001",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T05:57:54.000Z"
        },
        {
            "movement_id": 20,
            "type": "in",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 100,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 8000000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T05:51:44.000Z"
        },
        {
            "movement_id": 21,
            "type": "in",
            "product": "DDR4 4GB RAM",
            "sku": "SMOKE-001",
            "quantity": 20,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 400000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T05:51:44.000Z"
        },
        {
            "movement_id": 18,
            "type": "in",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 100,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 8000000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T05:44:33.000Z"
        },
        {
            "movement_id": 19,
            "type": "in",
            "product": "DDR4 4GB RAM",
            "sku": "SMOKE-001",
            "quantity": 20,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 400000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-19T05:44:33.000Z"
        },
        {
            "movement_id": 17,
            "type": "in",
            "product": "DDR4 4GB RAM",
            "sku": "SMOKE-001",
            "quantity": 20,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 400000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-18T08:21:52.000Z"
        },
        {
            "movement_id": 16,
            "type": "in",
            "product": "EPP-004-Keyboard",
            "sku": "SMOKE-SKU-1",
            "quantity": 100,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 8000000,
            "purpose": "PO Receipt (PO-2026-005)",
            "reference": "PO-2026-005",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-18T08:21:51.000Z"
        },
        {
            "movement_id": 15,
            "type": "out",
            "product": "NCT Card Reader",
            "sku": "-",
            "quantity": 1,
            "from_location": "Branch C",
            "to_location": "-",
            "value": 1000,
            "purpose": "sale",
            "reference": "REF0001",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T13:25:10.000Z"
        },
        {
            "movement_id": 13,
            "type": "in",
            "product": "NCT Card Reader",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 10000,
            "purpose": "PO Receipt (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T13:20:58.000Z"
        },
        {
            "movement_id": 14,
            "type": "in",
            "product": "abc",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 60000,
            "purpose": "PO Receipt (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T13:20:58.000Z"
        },
        {
            "movement_id": 12,
            "type": "return",
            "product": "Unknown",
            "sku": "-",
            "quantity": 1,
            "from_location": "-",
            "to_location": "-",
            "value": 0,
            "purpose": null,
            "reference": null,
            "performed_by": "System",
            "timestamp": "2026-08-17T08:37:51.000Z"
        },
        {
            "movement_id": 11,
            "type": "damage",
            "product": "Unknown",
            "sku": "-",
            "quantity": -1,
            "from_location": "-",
            "to_location": "-",
            "value": 0,
            "purpose": null,
            "reference": null,
            "performed_by": "System",
            "timestamp": "2026-08-17T08:37:11.000Z"
        },
        {
            "movement_id": 9,
            "type": "in",
            "product": "NCT Card Reader",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 10000,
            "purpose": "PO Receipt (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T08:18:15.000Z"
        },
        {
            "movement_id": 10,
            "type": "in",
            "product": "abc",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 60000,
            "purpose": "PO Receipt (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T08:18:15.000Z"
        },
        {
            "movement_id": 8,
            "type": "in",
            "product": "ATM Peripheral Kit",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Warehouse A",
            "value": 10000,
            "purpose": "PO Receipt (PO-SMOKE-1786954112549)",
            "reference": "PO-SMOKE-1786954112549",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T08:08:32.000Z"
        },
        {
            "movement_id": 7,
            "type": "in",
            "product": "ATM Peripheral Kit",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Warehouse A",
            "value": 10000,
            "purpose": "PO Receipt (PO-SMOKE-1786953444657)",
            "reference": "PO-SMOKE-1786953444657",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T07:57:24.000Z"
        },
        {
            "movement_id": 5,
            "type": "in",
            "product": "NCT Card Reader",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 10000,
            "purpose": "PO Delivery (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T05:52:40.000Z"
        },
        {
            "movement_id": 6,
            "type": "in",
            "product": "abc",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Branch C",
            "value": 60000,
            "purpose": "PO Delivery (PO-2026-004)",
            "reference": "PO-2026-004",
            "performed_by": "Your Admin",
            "timestamp": "2026-08-17T05:52:40.000Z"
        },
        {
            "movement_id": 3,
            "type": "purchase",
            "product": "ATM Peripheral Kit",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "Warehouse A",
            "value": 0,
            "purpose": "Initial stock",
            "reference": "PUR-001",
            "performed_by": "System",
            "timestamp": "2026-08-14T12:09:55.000Z"
        },
        {
            "movement_id": 4,
            "type": "sale",
            "product": "Cash Dispense Module",
            "sku": "-",
            "quantity": 3,
            "from_location": "Store B",
            "to_location": "-",
            "value": 0,
            "purpose": "Field deployment",
            "reference": "OUT-001",
            "performed_by": "System",
            "timestamp": "2026-08-14T12:09:55.000Z"
        },
        {
            "movement_id": 1,
            "type": "purchase",
            "product": "ATM Peripheral Kit",
            "sku": "-",
            "quantity": 10,
            "from_location": "-",
            "to_location": "-",
            "value": 0,
            "purpose": null,
            "reference": null,
            "performed_by": "System",
            "timestamp": "2026-08-12T06:40:47.000Z"
        },
        {
            "movement_id": 2,
            "type": "sale",
            "product": "Cash Dispense Module",
            "sku": "-",
            "quantity": -3,
            "from_location": "-",
            "to_location": "-",
            "value": 0,
            "purpose": null,
            "reference": null,
            "performed_by": "System",
            "timestamp": "2026-08-12T06:40:47.000Z"
        }
    ]
}

- Audit
Request URL
http://localhost:5173/api/v1/reports/audit-trail?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "report_type": "audit_trail",
    "generated_at": "2026-08-20T07:54:52.937Z",
    "filters": {},
    "summary": {
        "total_events": 456,
        "by_action": {
            "generate": 148,
            "read": 204,
            "login": 37,
            "create": 51,
            "update": 14,
            "stock.receive": 1,
            "stock.issue": 1
        }
    },
    "data": [
        {
            "log_id": 456,
            "timestamp": "2026-08-20T07:54:15.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 455,
            "timestamp": "2026-08-20T07:53:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 454,
            "timestamp": "2026-08-20T07:53:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 453,
            "timestamp": "2026-08-20T07:52:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 452,
            "timestamp": "2026-08-20T07:51:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 451,
            "timestamp": "2026-08-20T07:46:59.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 450,
            "timestamp": "2026-08-20T07:46:37.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 448,
            "timestamp": "2026-08-20T07:45:17.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 449,
            "timestamp": "2026-08-20T07:45:17.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 447,
            "timestamp": "2026-08-20T07:45:16.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 446,
            "timestamp": "2026-08-20T07:45:15.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 445,
            "timestamp": "2026-08-20T07:45:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 444,
            "timestamp": "2026-08-20T07:41:49.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 443,
            "timestamp": "2026-08-20T07:40:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 435,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 436,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 437,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 438,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 439,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 440,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 441,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 442,
            "timestamp": "2026-08-20T07:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 434,
            "timestamp": "2026-08-20T07:38:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 433,
            "timestamp": "2026-08-20T07:29:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 432,
            "timestamp": "2026-08-20T07:29:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 431,
            "timestamp": "2026-08-20T07:29:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 430,
            "timestamp": "2026-08-20T07:21:41.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 428,
            "timestamp": "2026-08-20T07:15:37.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 429,
            "timestamp": "2026-08-20T07:15:37.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 427,
            "timestamp": "2026-08-20T07:15:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 426,
            "timestamp": "2026-08-20T07:15:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 425,
            "timestamp": "2026-08-20T07:15:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 424,
            "timestamp": "2026-08-20T07:15:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 423,
            "timestamp": "2026-08-20T06:53:56.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 422,
            "timestamp": "2026-08-20T06:53:55.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 421,
            "timestamp": "2026-08-20T06:53:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 420,
            "timestamp": "2026-08-20T06:53:14.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 413,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 414,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 415,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 416,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 417,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 418,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 419,
            "timestamp": "2026-08-20T06:45:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 412,
            "timestamp": "2026-08-20T06:23:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 411,
            "timestamp": "2026-08-20T06:22:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 410,
            "timestamp": "2026-08-20T06:22:53.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 408,
            "timestamp": "2026-08-20T06:22:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 409,
            "timestamp": "2026-08-20T06:22:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 407,
            "timestamp": "2026-08-20T06:22:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 406,
            "timestamp": "2026-08-20T06:22:49.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 405,
            "timestamp": "2026-08-20T06:22:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 404,
            "timestamp": "2026-08-20T05:57:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 403,
            "timestamp": "2026-08-20T05:57:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 402,
            "timestamp": "2026-08-20T05:56:21.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 401,
            "timestamp": "2026-08-20T05:56:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 400,
            "timestamp": "2026-08-20T05:56:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 399,
            "timestamp": "2026-08-20T05:56:17.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 398,
            "timestamp": "2026-08-20T05:56:12.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 397,
            "timestamp": "2026-08-20T05:56:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 396,
            "timestamp": "2026-08-20T05:56:03.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 395,
            "timestamp": "2026-08-20T05:47:19.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 394,
            "timestamp": "2026-08-20T05:25:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 393,
            "timestamp": "2026-08-20T05:20:27.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 392,
            "timestamp": "2026-08-20T05:20:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 391,
            "timestamp": "2026-08-20T05:20:04.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 390,
            "timestamp": "2026-08-20T05:17:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 389,
            "timestamp": "2026-08-20T05:17:26.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 388,
            "timestamp": "2026-08-20T05:17:25.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 386,
            "timestamp": "2026-08-20T05:17:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 387,
            "timestamp": "2026-08-20T05:17:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 385,
            "timestamp": "2026-08-20T05:17:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 384,
            "timestamp": "2026-08-20T05:17:21.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 383,
            "timestamp": "2026-08-20T05:17:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 382,
            "timestamp": "2026-08-20T05:02:16.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 381,
            "timestamp": "2026-08-20T05:02:14.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 380,
            "timestamp": "2026-08-20T05:02:11.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 379,
            "timestamp": "2026-08-20T05:02:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 378,
            "timestamp": "2026-08-20T05:02:07.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 377,
            "timestamp": "2026-08-20T05:02:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 376,
            "timestamp": "2026-08-20T05:01:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 375,
            "timestamp": "2026-08-19T15:47:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 374,
            "timestamp": "2026-08-19T15:47:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 373,
            "timestamp": "2026-08-19T15:47:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 372,
            "timestamp": "2026-08-19T15:47:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 371,
            "timestamp": "2026-08-19T15:46:57.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated purchase order report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 370,
            "timestamp": "2026-08-19T15:46:56.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 369,
            "timestamp": "2026-08-19T15:46:55.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 368,
            "timestamp": "2026-08-19T15:46:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 367,
            "timestamp": "2026-08-19T15:46:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 366,
            "timestamp": "2026-08-19T15:46:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 365,
            "timestamp": "2026-08-19T15:46:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 364,
            "timestamp": "2026-08-19T15:46:24.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 363,
            "timestamp": "2026-08-19T15:46:17.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 362,
            "timestamp": "2026-08-19T15:44:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 361,
            "timestamp": "2026-08-19T15:40:07.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 360,
            "timestamp": "2026-08-19T15:23:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 359,
            "timestamp": "2026-08-19T15:12:07.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 358,
            "timestamp": "2026-08-19T15:09:12.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 357,
            "timestamp": "2026-08-19T15:05:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 356,
            "timestamp": "2026-08-19T15:05:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 355,
            "timestamp": "2026-08-19T15:01:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 354,
            "timestamp": "2026-08-19T14:53:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockReturn",
            "entity_id": 1,
            "message": "Return recorded for product 7: 4",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 353,
            "timestamp": "2026-08-19T14:52:01.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 352,
            "timestamp": "2026-08-19T14:51:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 351,
            "timestamp": "2026-08-19T14:40:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 350,
            "timestamp": "2026-08-19T14:40:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 349,
            "timestamp": "2026-08-19T14:40:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 348,
            "timestamp": "2026-08-19T14:40:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 347,
            "timestamp": "2026-08-19T14:40:04.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 346,
            "timestamp": "2026-08-19T14:39:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 345,
            "timestamp": "2026-08-19T14:39:42.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 344,
            "timestamp": "2026-08-19T14:29:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "DamagedStock",
            "entity_id": 1,
            "message": "Damage recorded for product 7: 1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 343,
            "timestamp": "2026-08-19T14:27:16.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockTransfer",
            "entity_id": 1,
            "message": "Transfer: EPP-004-Keyboard x4 from Branch C to Store A",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 342,
            "timestamp": "2026-08-19T14:23:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockOut",
            "entity_id": 1,
            "message": "Stock out created: EPP-004-Keyboard x2",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 341,
            "timestamp": "2026-08-19T14:14:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 340,
            "timestamp": "2026-08-19T14:14:03.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 339,
            "timestamp": "2026-08-19T14:07:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 338,
            "timestamp": "2026-08-19T14:07:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 337,
            "timestamp": "2026-08-19T13:54:25.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 336,
            "timestamp": "2026-08-19T13:45:15.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 334,
            "timestamp": "2026-08-19T13:44:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 335,
            "timestamp": "2026-08-19T13:44:29.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 333,
            "timestamp": "2026-08-19T13:20:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 332,
            "timestamp": "2026-08-19T13:20:15.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 331,
            "timestamp": "2026-08-19T13:03:37.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 330,
            "timestamp": "2026-08-19T13:02:47.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 329,
            "timestamp": "2026-08-19T12:57:17.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 328,
            "timestamp": "2026-08-19T12:31:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 327,
            "timestamp": "2026-08-19T09:36:39.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 326,
            "timestamp": "2026-08-19T06:42:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 325,
            "timestamp": "2026-08-19T06:42:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 324,
            "timestamp": "2026-08-19T05:57:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockOut",
            "entity_id": 1,
            "message": "Stock out created: EPP-004-Keyboard x2",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 322,
            "timestamp": "2026-08-19T05:51:44.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 1,
            "message": "Stock received: EPP-004-Keyboard x100 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 323,
            "timestamp": "2026-08-19T05:51:44.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 2,
            "message": "Stock received: DDR4 4GB RAM x20 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 320,
            "timestamp": "2026-08-19T05:44:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 17,
            "message": "Stock received: EPP-004-Keyboard x100 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 321,
            "timestamp": "2026-08-19T05:44:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 18,
            "message": "Stock received: DDR4 4GB RAM x20 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 319,
            "timestamp": "2026-08-18T08:21:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 16,
            "message": "Stock received: DDR4 4GB RAM x20 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 318,
            "timestamp": "2026-08-18T08:21:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 15,
            "message": "Stock received: EPP-004-Keyboard x100 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 317,
            "timestamp": "2026-08-18T08:19:44.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "PurchaseOrder",
            "entity_id": 13,
            "message": "Updated PO PO-2026-005",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 316,
            "timestamp": "2026-08-18T08:17:56.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 315,
            "timestamp": "2026-08-18T08:17:44.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "PurchaseOrder",
            "entity_id": 13,
            "message": "Created PO PO-2026-005",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 312,
            "timestamp": "2026-08-18T08:12:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 4,
            "message": "Updated product NCT Card Reader",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 313,
            "timestamp": "2026-08-18T08:12:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 14,
            "message": "Uploaded image 4450754646-445-0754646-NCR-Card-Readers-NEMO-(MFR)-Track-Two-Read-and-Smart-ATM-Machine-Spare-Parts-Manufacturer.jpg for product 4",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 314,
            "timestamp": "2026-08-18T08:12:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 11,
            "message": "Uploaded video test-video.mp4 for product 4",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 309,
            "timestamp": "2026-08-18T08:09:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 6,
            "message": "Updated product DDR4 4GB RAM",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 310,
            "timestamp": "2026-08-18T08:09:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 13,
            "message": "Uploaded image H5f36982d3efe4ecd94eaa95ecba3bec4T.png for product 6",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 311,
            "timestamp": "2026-08-18T08:09:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 10,
            "message": "Uploaded video test-video.mp4 for product 6",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 306,
            "timestamp": "2026-08-18T08:08:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 7,
            "message": "Updated product EPP-004-Keyboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 307,
            "timestamp": "2026-08-18T08:08:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 12,
            "message": "Uploaded image ATM-Machine-Parts-GRG-Banking-Keypad-EPP-004-Keyboard-YT2.232.0301.png for product 7",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 308,
            "timestamp": "2026-08-18T08:08:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 9,
            "message": "Uploaded video test-video.mp4 for product 7",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 303,
            "timestamp": "2026-08-18T08:06:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 8,
            "message": "Updated product Wincor-Nixdorf CASH DISPENSER",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 304,
            "timestamp": "2026-08-18T08:06:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 11,
            "message": "Uploaded image ATM-Machine-Spare-Parts-Wincor-Nixdorf-2050-CMD-V4-Module-With-Single-Reject-Stacker-01750109659-1750109659.jpg for product 8",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 305,
            "timestamp": "2026-08-18T08:06:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 8,
            "message": "Uploaded video test-video.mp4 for product 8",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 302,
            "timestamp": "2026-08-18T08:04:37.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 301,
            "timestamp": "2026-08-18T08:04:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Brand",
            "entity_id": 5,
            "message": "Created brand Wincor-Nixdorf",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 300,
            "timestamp": "2026-08-18T07:49:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 299,
            "timestamp": "2026-08-18T07:49:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 298,
            "timestamp": "2026-08-18T07:49:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 297,
            "timestamp": "2026-08-18T07:48:59.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 296,
            "timestamp": "2026-08-18T07:48:57.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 295,
            "timestamp": "2026-08-18T07:48:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 294,
            "timestamp": "2026-08-18T07:48:48.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 293,
            "timestamp": "2026-08-18T07:46:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 292,
            "timestamp": "2026-08-18T07:43:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 291,
            "timestamp": "2026-08-18T07:43:38.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 290,
            "timestamp": "2026-08-18T07:43:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 289,
            "timestamp": "2026-08-18T07:42:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 288,
            "timestamp": "2026-08-18T07:40:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 287,
            "timestamp": "2026-08-18T07:39:49.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 286,
            "timestamp": "2026-08-18T07:23:33.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 285,
            "timestamp": "2026-08-18T07:22:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 284,
            "timestamp": "2026-08-18T07:22:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 283,
            "timestamp": "2026-08-18T07:22:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 282,
            "timestamp": "2026-08-18T07:22:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 281,
            "timestamp": "2026-08-18T07:22:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 280,
            "timestamp": "2026-08-18T07:22:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 279,
            "timestamp": "2026-08-18T07:20:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 278,
            "timestamp": "2026-08-18T07:12:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 277,
            "timestamp": "2026-08-18T07:11:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 276,
            "timestamp": "2026-08-18T07:11:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 275,
            "timestamp": "2026-08-18T07:10:37.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 274,
            "timestamp": "2026-08-18T07:10:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 273,
            "timestamp": "2026-08-18T07:10:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 272,
            "timestamp": "2026-08-18T07:10:25.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 271,
            "timestamp": "2026-08-18T06:54:48.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 270,
            "timestamp": "2026-08-18T06:54:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 269,
            "timestamp": "2026-08-17T13:25:10.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockMovement",
            "entity_id": 15,
            "message": "Stock out: E2E Test Product 1786611587627 x1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 267,
            "timestamp": "2026-08-17T13:20:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 13,
            "message": "Stock received: E2E Test Product 1786611587627 x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 268,
            "timestamp": "2026-08-17T13:20:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 14,
            "message": "Stock received: abc x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 266,
            "timestamp": "2026-08-17T12:20:04.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 265,
            "timestamp": "2026-08-17T12:19:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 264,
            "timestamp": "2026-08-17T12:19:22.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 263,
            "timestamp": "2026-08-17T12:18:39.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 262,
            "timestamp": "2026-08-17T12:18:38.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 261,
            "timestamp": "2026-08-17T12:18:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 260,
            "timestamp": "2026-08-17T12:18:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 259,
            "timestamp": "2026-08-17T12:18:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 258,
            "timestamp": "2026-08-17T12:18:04.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 257,
            "timestamp": "2026-08-17T12:18:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 256,
            "timestamp": "2026-08-17T12:18:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 255,
            "timestamp": "2026-08-17T12:17:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 254,
            "timestamp": "2026-08-17T12:17:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 253,
            "timestamp": "2026-08-17T12:17:26.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 252,
            "timestamp": "2026-08-17T12:07:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 251,
            "timestamp": "2026-08-17T12:07:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 249,
            "timestamp": "2026-08-17T12:07:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 250,
            "timestamp": "2026-08-17T12:07:02.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 248,
            "timestamp": "2026-08-17T12:07:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 247,
            "timestamp": "2026-08-17T12:07:00.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 246,
            "timestamp": "2026-08-17T12:06:57.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 244,
            "timestamp": "2026-08-17T12:06:42.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 245,
            "timestamp": "2026-08-17T12:06:42.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 242,
            "timestamp": "2026-08-17T10:56:20.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 243,
            "timestamp": "2026-08-17T10:56:20.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 241,
            "timestamp": "2026-08-17T08:37:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockMovement",
            "entity_id": 12,
            "message": "Return recorded for product 5: 1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 240,
            "timestamp": "2026-08-17T08:37:11.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockMovement",
            "entity_id": 11,
            "message": "Damage recorded for product 5: -1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 238,
            "timestamp": "2026-08-17T08:18:15.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 11,
            "message": "Stock received: E2E Test Product 1786611587627 x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 239,
            "timestamp": "2026-08-17T08:18:15.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 12,
            "message": "Stock received: abc x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 237,
            "timestamp": "2026-08-17T08:08:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 10,
            "message": "Stock received: ATM Peripheral Kit x10 to Warehouse A",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 236,
            "timestamp": "2026-08-17T07:57:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 9,
            "message": "Stock received: ATM Peripheral Kit x10 to Warehouse A",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 234,
            "timestamp": "2026-08-17T05:52:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 7,
            "message": "Stock received: E2E Test Product 1786611587627 x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 235,
            "timestamp": "2026-08-17T05:52:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "StockBatch",
            "entity_id": 8,
            "message": "Stock received: abc x10 to Branch C",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 233,
            "timestamp": "2026-08-17T05:49:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "PurchaseOrder",
            "entity_id": 5,
            "message": "Updated PO PO-2026-004",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 232,
            "timestamp": "2026-08-17T05:48:10.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "PurchaseOrder",
            "entity_id": 5,
            "message": "Updated PO PO-2026-004",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 231,
            "timestamp": "2026-08-17T05:45:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "PurchaseOrder",
            "entity_id": 6,
            "message": "Updated PO SMOKE-PO-1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 230,
            "timestamp": "2026-08-17T05:41:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "PurchaseOrder",
            "entity_id": 6,
            "message": "Updated PO SMOKE-PO-1",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 229,
            "timestamp": "2026-08-17T05:38:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 228,
            "timestamp": "2026-08-17T05:38:41.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 227,
            "timestamp": "2026-08-17T05:38:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 226,
            "timestamp": "2026-08-17T05:38:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 225,
            "timestamp": "2026-08-17T05:38:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 224,
            "timestamp": "2026-08-17T05:38:26.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 223,
            "timestamp": "2026-08-17T05:38:21.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 222,
            "timestamp": "2026-08-17T05:37:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 221,
            "timestamp": "2026-08-17T05:37:25.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 220,
            "timestamp": "2026-08-17T05:37:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 219,
            "timestamp": "2026-08-15T21:52:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 218,
            "timestamp": "2026-08-15T21:52:07.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 217,
            "timestamp": "2026-08-15T21:51:48.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 216,
            "timestamp": "2026-08-15T21:51:44.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 215,
            "timestamp": "2026-08-15T20:24:28.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 214,
            "timestamp": "2026-08-15T20:24:09.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 213,
            "timestamp": "2026-08-15T20:23:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 212,
            "timestamp": "2026-08-15T20:20:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 211,
            "timestamp": "2026-08-15T20:17:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 210,
            "timestamp": "2026-08-15T20:16:54.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 209,
            "timestamp": "2026-08-15T20:16:50.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 208,
            "timestamp": "2026-08-15T20:16:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 207,
            "timestamp": "2026-08-15T20:16:04.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 206,
            "timestamp": "2026-08-15T20:09:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 205,
            "timestamp": "2026-08-15T20:08:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 204,
            "timestamp": "2026-08-15T20:08:44.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 203,
            "timestamp": "2026-08-15T20:08:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 202,
            "timestamp": "2026-08-15T20:08:33.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 201,
            "timestamp": "2026-08-15T20:08:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 200,
            "timestamp": "2026-08-15T20:08:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 199,
            "timestamp": "2026-08-15T20:08:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 198,
            "timestamp": "2026-08-15T20:08:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 197,
            "timestamp": "2026-08-15T20:08:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 196,
            "timestamp": "2026-08-15T20:06:30.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 193,
            "timestamp": "2026-08-15T20:03:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 194,
            "timestamp": "2026-08-15T20:03:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 195,
            "timestamp": "2026-08-15T20:03:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "127.0.0.1"
        },
        {
            "log_id": 192,
            "timestamp": "2026-08-15T18:42:40.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 191,
            "timestamp": "2026-08-15T18:42:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 190,
            "timestamp": "2026-08-15T18:42:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 189,
            "timestamp": "2026-08-15T18:42:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 188,
            "timestamp": "2026-08-15T18:42:25.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 187,
            "timestamp": "2026-08-15T18:42:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 186,
            "timestamp": "2026-08-15T18:42:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 185,
            "timestamp": "2026-08-15T18:42:17.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 184,
            "timestamp": "2026-08-15T16:13:57.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 183,
            "timestamp": "2026-08-15T16:08:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 182,
            "timestamp": "2026-08-15T16:08:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 181,
            "timestamp": "2026-08-15T16:08:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 180,
            "timestamp": "2026-08-15T16:08:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 179,
            "timestamp": "2026-08-15T16:08:27.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 178,
            "timestamp": "2026-08-15T16:05:11.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 177,
            "timestamp": "2026-08-15T16:05:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 176,
            "timestamp": "2026-08-15T16:05:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 175,
            "timestamp": "2026-08-15T16:05:07.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 174,
            "timestamp": "2026-08-15T16:05:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 173,
            "timestamp": "2026-08-15T16:05:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 172,
            "timestamp": "2026-08-15T16:05:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 171,
            "timestamp": "2026-08-15T16:04:36.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 170,
            "timestamp": "2026-08-15T16:00:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 169,
            "timestamp": "2026-08-15T15:58:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 168,
            "timestamp": "2026-08-15T15:58:10.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 167,
            "timestamp": "2026-08-15T15:58:09.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 166,
            "timestamp": "2026-08-15T15:58:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 165,
            "timestamp": "2026-08-15T15:57:53.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 164,
            "timestamp": "2026-08-15T15:56:56.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 163,
            "timestamp": "2026-08-15T15:56:40.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 162,
            "timestamp": "2026-08-15T14:25:25.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 161,
            "timestamp": "2026-08-15T14:09:43.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 160,
            "timestamp": "2026-08-15T14:03:41.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 159,
            "timestamp": "2026-08-15T12:44:13.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 158,
            "timestamp": "2026-08-15T12:34:14.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "PurchaseOrder",
            "entity_id": 5,
            "message": "Created PO PO-2026-004",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 157,
            "timestamp": "2026-08-15T12:28:35.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 156,
            "timestamp": "2026-08-15T10:13:55.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Supplier",
            "entity_id": 3,
            "message": "Created supplier WinnF",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 155,
            "timestamp": "2026-08-15T10:12:39.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Location",
            "entity_id": 4,
            "message": "Created location Store A",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 154,
            "timestamp": "2026-08-15T10:11:48.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 153,
            "timestamp": "2026-08-15T10:11:46.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 152,
            "timestamp": "2026-08-15T10:11:45.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 151,
            "timestamp": "2026-08-15T10:11:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 150,
            "timestamp": "2026-08-15T10:11:42.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 149,
            "timestamp": "2026-08-15T10:11:38.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 148,
            "timestamp": "2026-08-15T10:10:09.000Z",
            "user": "Jaribu",
            "user_email": "jaribu@example.com",
            "action": "create",
            "entity": "User",
            "entity_id": 7,
            "message": "Registered user jaribu@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 147,
            "timestamp": "2026-08-15T10:06:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 146,
            "timestamp": "2026-08-15T10:04:07.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Brand",
            "entity_id": 4,
            "message": "Created brand ABC",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 145,
            "timestamp": "2026-08-15T10:03:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Brand",
            "entity_id": 3,
            "message": "Updated brand Cisco",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 144,
            "timestamp": "2026-08-15T10:02:51.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Category",
            "entity_id": 5,
            "message": "Created category jaribu",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 141,
            "timestamp": "2026-08-15T09:59:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Product",
            "entity_id": 5,
            "message": "Created product abc",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 142,
            "timestamp": "2026-08-15T09:59:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 10,
            "message": "Uploaded image atm_kit.png for product 5",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 143,
            "timestamp": "2026-08-15T09:59:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 7,
            "message": "Uploaded video test-video.mp4 for product 5",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 140,
            "timestamp": "2026-08-15T09:49:37.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 139,
            "timestamp": "2026-08-14T20:04:35.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 138,
            "timestamp": "2026-08-14T20:02:52.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 137,
            "timestamp": "2026-08-14T19:35:43.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 136,
            "timestamp": "2026-08-14T19:23:17.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 135,
            "timestamp": "2026-08-14T19:22:28.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 134,
            "timestamp": "2026-08-14T19:22:26.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 133,
            "timestamp": "2026-08-14T19:22:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated movements summary report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 132,
            "timestamp": "2026-08-14T19:22:21.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated low stock alert report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 131,
            "timestamp": "2026-08-14T19:22:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated FIFO cost report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 130,
            "timestamp": "2026-08-14T19:22:16.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated stock valuation report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 129,
            "timestamp": "2026-08-14T19:22:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 128,
            "timestamp": "2026-08-14T19:21:41.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 126,
            "timestamp": "2026-08-14T19:21:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 127,
            "timestamp": "2026-08-14T19:21:29.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 125,
            "timestamp": "2026-08-14T19:13:24.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 124,
            "timestamp": "2026-08-14T19:13:13.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 123,
            "timestamp": "2026-08-14T19:13:06.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 122,
            "timestamp": "2026-08-14T19:07:54.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 121,
            "timestamp": "2026-08-14T19:07:29.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 120,
            "timestamp": "2026-08-14T19:07:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 119,
            "timestamp": "2026-08-14T19:06:16.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 118,
            "timestamp": "2026-08-14T19:05:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 117,
            "timestamp": "2026-08-14T19:02:26.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 115,
            "timestamp": "2026-08-14T19:02:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 116,
            "timestamp": "2026-08-14T19:02:06.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 114,
            "timestamp": "2026-08-14T18:57:41.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 113,
            "timestamp": "2026-08-14T18:47:40.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 112,
            "timestamp": "2026-08-14T17:50:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 111,
            "timestamp": "2026-08-14T13:17:55.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 110,
            "timestamp": "2026-08-14T13:16:53.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 109,
            "timestamp": "2026-08-14T13:16:43.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 108,
            "timestamp": "2026-08-14T13:14:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 107,
            "timestamp": "2026-08-14T13:12:44.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 106,
            "timestamp": "2026-08-14T13:10:18.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 105,
            "timestamp": "2026-08-14T13:10:04.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 104,
            "timestamp": "2026-08-14T13:09:48.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 102,
            "timestamp": "2026-08-14T13:06:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 103,
            "timestamp": "2026-08-14T13:06:08.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 101,
            "timestamp": "2026-08-14T13:05:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 100,
            "timestamp": "2026-08-14T12:54:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "generate",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated audit trail report",
            "ip_address": "::1"
        },
        {
            "log_id": 99,
            "timestamp": "2026-08-14T12:54:36.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 98,
            "timestamp": "2026-08-14T12:20:39.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 96,
            "timestamp": "2026-08-14T12:20:12.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 97,
            "timestamp": "2026-08-14T12:20:12.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Category",
            "entity_id": 4,
            "message": "Created category Permission Check Category",
            "ip_address": "::1"
        },
        {
            "log_id": 95,
            "timestamp": "2026-08-14T12:20:11.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 94,
            "timestamp": "2026-08-14T12:13:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 93,
            "timestamp": "2026-08-14T12:03:03.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 91,
            "timestamp": "2026-08-14T12:02:57.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 92,
            "timestamp": "2026-08-14T12:02:57.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 90,
            "timestamp": "2026-08-14T09:43:20.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 89,
            "timestamp": "2026-08-14T08:00:11.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 88,
            "timestamp": "2026-08-14T07:51:05.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 87,
            "timestamp": "2026-08-14T07:13:39.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 86,
            "timestamp": "2026-08-14T07:00:27.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 85,
            "timestamp": "2026-08-14T06:57:22.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 83,
            "timestamp": "2026-08-14T06:57:13.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 84,
            "timestamp": "2026-08-14T06:57:13.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 82,
            "timestamp": "2026-08-14T06:56:38.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 81,
            "timestamp": "2026-08-14T06:56:37.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 79,
            "timestamp": "2026-08-14T06:53:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 80,
            "timestamp": "2026-08-14T06:53:31.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 78,
            "timestamp": "2026-08-14T06:49:43.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 77,
            "timestamp": "2026-08-14T06:42:45.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 75,
            "timestamp": "2026-08-14T06:18:09.000Z",
            "user": "Stock Operator 1",
            "user_email": "stock1@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 4,
            "message": "User logged in: stock1@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 76,
            "timestamp": "2026-08-14T06:18:09.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 74,
            "timestamp": "2026-08-14T06:13:34.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 73,
            "timestamp": "2026-08-14T06:13:20.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 72,
            "timestamp": "2026-08-14T06:13:07.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 71,
            "timestamp": "2026-08-14T06:13:06.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 70,
            "timestamp": "2026-08-14T06:11:01.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 68,
            "timestamp": "2026-08-14T06:10:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 3,
            "message": "Updated product E2E Test Product 1786611543809",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 69,
            "timestamp": "2026-08-14T06:10:35.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 9,
            "message": "Uploaded image atm_kit.png for product 3",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 65,
            "timestamp": "2026-08-14T06:09:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 3,
            "message": "Updated product E2E Test Product 1786611543809",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 66,
            "timestamp": "2026-08-14T06:09:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 8,
            "message": "Uploaded image atm_kit.png for product 3",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 67,
            "timestamp": "2026-08-14T06:09:58.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 6,
            "message": "Uploaded video test-video.mp4 for product 3",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 63,
            "timestamp": "2026-08-14T06:09:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 3,
            "message": "Updated product E2E Test Product 1786611543809",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 64,
            "timestamp": "2026-08-14T06:09:19.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 7,
            "message": "Uploaded image atm_kit.png for product 3",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 61,
            "timestamp": "2026-08-14T06:07:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "update",
            "entity": "Product",
            "entity_id": 3,
            "message": "Updated product E2E Test Product 1786611543809",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 62,
            "timestamp": "2026-08-14T06:07:34.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 6,
            "message": "Uploaded image test-image.png for product 3",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 60,
            "timestamp": "2026-08-14T06:03:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 59,
            "timestamp": "2026-08-13T14:02:50.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 58,
            "timestamp": "2026-08-13T13:49:37.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 57,
            "timestamp": "2026-08-13T13:49:32.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Permission",
            "entity_id": null,
            "message": "Listed permissions",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 56,
            "timestamp": "2026-08-13T13:48:56.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "read",
            "entity": "Report",
            "entity_id": null,
            "message": "Generated reports overview",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 55,
            "timestamp": "2026-08-13T13:44:27.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 54,
            "timestamp": "2026-08-13T13:32:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 53,
            "timestamp": "2026-08-13T13:31:11.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 52,
            "timestamp": "2026-08-13T11:35:31.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 50,
            "timestamp": "2026-08-13T11:34:31.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 51,
            "timestamp": "2026-08-13T11:34:31.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 49,
            "timestamp": "2026-08-13T11:03:31.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 47,
            "timestamp": "2026-08-13T11:03:26.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 48,
            "timestamp": "2026-08-13T11:03:26.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 46,
            "timestamp": "2026-08-13T11:02:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 45,
            "timestamp": "2026-08-13T10:58:57.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 44,
            "timestamp": "2026-08-13T10:57:50.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 43,
            "timestamp": "2026-08-13T10:56:53.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 42,
            "timestamp": "2026-08-13T10:56:41.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 41,
            "timestamp": "2026-08-13T10:55:36.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 40,
            "timestamp": "2026-08-13T10:52:44.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 38,
            "timestamp": "2026-08-13T10:51:30.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 39,
            "timestamp": "2026-08-13T10:51:30.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 37,
            "timestamp": "2026-08-13T10:46:21.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 36,
            "timestamp": "2026-08-13T10:45:41.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 35,
            "timestamp": "2026-08-13T10:43:41.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 34,
            "timestamp": "2026-08-13T10:43:21.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 33,
            "timestamp": "2026-08-13T10:40:09.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 32,
            "timestamp": "2026-08-13T10:40:08.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 31,
            "timestamp": "2026-08-13T10:39:57.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 30,
            "timestamp": "2026-08-13T10:36:45.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 29,
            "timestamp": "2026-08-13T10:36:44.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 28,
            "timestamp": "2026-08-13T10:20:50.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 27,
            "timestamp": "2026-08-13T10:20:43.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 26,
            "timestamp": "2026-08-13T10:20:36.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 25,
            "timestamp": "2026-08-13T10:20:12.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 24,
            "timestamp": "2026-08-13T10:15:45.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 23,
            "timestamp": "2026-08-13T10:15:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 22,
            "timestamp": "2026-08-13T10:14:47.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 21,
            "timestamp": "2026-08-13T10:14:44.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 20,
            "timestamp": "2026-08-13T10:06:46.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 19,
            "timestamp": "2026-08-13T10:02:56.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 18,
            "timestamp": "2026-08-13T10:02:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 17,
            "timestamp": "2026-08-13T09:59:32.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 16,
            "timestamp": "2026-08-13T09:50:50.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 15,
            "timestamp": "2026-08-13T09:35:17.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::1"
        },
        {
            "log_id": 14,
            "timestamp": "2026-08-13T09:19:25.000Z",
            "user": "System",
            "user_email": "-",
            "action": "read",
            "entity": "Dashboard",
            "entity_id": null,
            "message": "Viewed dashboard",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 13,
            "timestamp": "2026-08-13T09:02:23.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductImage",
            "entity_id": 3,
            "message": "Uploaded image test-image.png for product 4",
            "ip_address": "::1"
        },
        {
            "log_id": 12,
            "timestamp": "2026-08-13T09:02:22.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 11,
            "timestamp": "2026-08-13T09:01:21.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::1"
        },
        {
            "log_id": 8,
            "timestamp": "2026-08-13T08:59:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 9,
            "timestamp": "2026-08-13T08:59:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Product",
            "entity_id": 4,
            "message": "Created product E2E Test Product 1786611587627",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 10,
            "timestamp": "2026-08-13T08:59:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "ProductVideo",
            "entity_id": 3,
            "message": "Uploaded video test-video.mp4 for product 4",
            "ip_address": "::1"
        },
        {
            "log_id": 6,
            "timestamp": "2026-08-13T08:59:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 7,
            "timestamp": "2026-08-13T08:59:03.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "create",
            "entity": "Product",
            "entity_id": 3,
            "message": "Created product E2E Test Product 1786611543809",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 5,
            "timestamp": "2026-08-13T08:55:38.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 4,
            "timestamp": "2026-08-13T08:55:08.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 3,
            "timestamp": "2026-08-13T08:53:10.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "login",
            "entity": "User",
            "entity_id": 1,
            "message": "User logged in: admin@example.com",
            "ip_address": "::ffff:127.0.0.1"
        },
        {
            "log_id": 1,
            "timestamp": "2026-08-12T06:40:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "stock.receive",
            "entity": "stock_in",
            "entity_id": null,
            "message": "Received initial stock for ATM Peripheral Kit",
            "ip_address": null
        },
        {
            "log_id": 2,
            "timestamp": "2026-08-12T06:40:47.000Z",
            "user": "Your Admin",
            "user_email": "admin@example.com",
            "action": "stock.issue",
            "entity": "stock_out",
            "entity_id": null,
            "message": "Issued Cash Dispense Module to field store",
            "ip_address": null
        }
    ]
}

- Purchase Orders
Request URL
http://localhost:5173/api/v1/reports/purchase-orders?startDate=2026-05-22&endDate=2026-08-20
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "report_type": "purchase_orders",
    "generated_at": "2026-08-20T07:55:22.274Z",
    "filters": {},
    "summary": {
        "total_pos": 12,
        "total_amount": 8520000,
        "total_paid": 25000,
        "total_balance_due": 8495000,
        "by_status": {
            "COMPLETED": 3,
            "DRAFT": 6,
            "ORDERED": 2,
            "APPROVED": 1
        },
        "by_payment": {
            "PAID": 3,
            "UNPAID": 8,
            "PARTIALLY_PAID": 1
        }
    },
    "data": [
        {
            "po_id": 13,
            "po_number": "PO-2026-005",
            "supplier": "Diebold Nixdorf Tanzania",
            "po_status": "COMPLETED",
            "payment_status": "PAID",
            "delivery_status": "RECEIVED",
            "total_amount": 8400000,
            "total_paid": 0,
            "balance_due": 8400000,
            "order_date": "2026-08-18T08:17:44.000Z",
            "expected_delivery": "2026-08-31T00:00:00.000Z",
            "actual_delivery": "2026-08-19T05:51:44.000Z",
            "batches_received": 2,
            "created_by": "Your Admin",
            "created_at": "2026-08-18T08:17:44.000Z"
        },
        {
            "po_id": 12,
            "po_number": "PO-SMOKE-1786954112549",
            "supplier": "NCR East Africa",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "RECEIVED",
            "total_amount": 2500,
            "total_paid": 0,
            "balance_due": 2500,
            "order_date": "2026-08-17T08:08:32.000Z",
            "expected_delivery": "2026-08-18T08:08:32.000Z",
            "actual_delivery": "2026-08-17T08:08:32.000Z",
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-17T08:08:32.000Z"
        },
        {
            "po_id": 11,
            "po_number": "PO-SMOKE-1786953444657",
            "supplier": "NCR East Africa",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "RECEIVED",
            "total_amount": 2500,
            "total_paid": 0,
            "balance_due": 2500,
            "order_date": "2026-08-17T07:57:24.000Z",
            "expected_delivery": "2026-08-18T07:57:24.000Z",
            "actual_delivery": "2026-08-17T07:57:24.000Z",
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-17T07:57:24.000Z"
        },
        {
            "po_id": 10,
            "po_number": "PO-SMOKE-1786953097504",
            "supplier": "NCR East Africa",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 2500,
            "total_paid": 0,
            "balance_due": 2500,
            "order_date": "2026-08-17T07:51:37.000Z",
            "expected_delivery": "2026-08-18T07:51:37.000Z",
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-17T07:51:37.000Z"
        },
        {
            "po_id": 9,
            "po_number": "PO-SMOKE-1786952940514",
            "supplier": "NCR East Africa",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 2500,
            "total_paid": 0,
            "balance_due": 2500,
            "order_date": "2026-08-17T07:49:00.000Z",
            "expected_delivery": "2026-08-18T07:49:00.000Z",
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-17T07:49:00.000Z"
        },
        {
            "po_id": 8,
            "po_number": "SMOKE-PO-1786810312337",
            "supplier": "Test Supplier 2",
            "po_status": "ORDERED",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 0,
            "total_paid": 0,
            "balance_due": 0,
            "order_date": "2026-08-15T16:11:52.000Z",
            "expected_delivery": null,
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Smoke Tester 2",
            "created_at": "2026-08-15T16:11:52.000Z"
        },
        {
            "po_id": 7,
            "po_number": "SMOKE-PO-1786810021816",
            "supplier": "Test Supplier",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 0,
            "total_paid": 0,
            "balance_due": 0,
            "order_date": "2026-08-15T16:07:01.000Z",
            "expected_delivery": null,
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Smoke Tester",
            "created_at": "2026-08-15T16:07:01.000Z"
        },
        {
            "po_id": 6,
            "po_number": "SMOKE-PO-1",
            "supplier": "Smoke Supplier",
            "po_status": "DRAFT",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 0,
            "total_paid": 0,
            "balance_due": 0,
            "order_date": "2026-08-15T15:50:33.000Z",
            "expected_delivery": "2026-08-28T00:00:00.000Z",
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Smoke Tester",
            "created_at": "2026-08-15T15:50:33.000Z"
        },
        {
            "po_id": 5,
            "po_number": "PO-2026-004",
            "supplier": "WinnF",
            "po_status": "COMPLETED",
            "payment_status": "PAID",
            "delivery_status": "RECEIVED",
            "total_amount": 70000,
            "total_paid": 0,
            "balance_due": 70000,
            "order_date": "2026-08-15T12:34:14.000Z",
            "expected_delivery": "2026-08-29T00:00:00.000Z",
            "actual_delivery": "2026-08-17T13:20:58.000Z",
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-15T12:34:14.000Z"
        },
        {
            "po_id": 1,
            "po_number": "PO-2026-001",
            "supplier": "NCR East Africa",
            "po_status": "COMPLETED",
            "payment_status": "PAID",
            "delivery_status": "RECEIVED",
            "total_amount": 10000,
            "total_paid": 10000,
            "balance_due": 0,
            "order_date": "2026-08-14T17:39:00.000Z",
            "expected_delivery": null,
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-14T17:39:00.000Z"
        },
        {
            "po_id": 3,
            "po_number": "PO-2026-002",
            "supplier": "Diebold Nixdorf Tanzania",
            "po_status": "ORDERED",
            "payment_status": "PARTIALLY_PAID",
            "delivery_status": "PARTIALLY_RECEIVED",
            "total_amount": 25000,
            "total_paid": 15000,
            "balance_due": 10000,
            "order_date": "2026-08-14T17:39:00.000Z",
            "expected_delivery": null,
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-14T17:39:00.000Z"
        },
        {
            "po_id": 4,
            "po_number": "PO-2026-003",
            "supplier": "NCR East Africa",
            "po_status": "APPROVED",
            "payment_status": "UNPAID",
            "delivery_status": "PENDING",
            "total_amount": 5000,
            "total_paid": 0,
            "balance_due": 5000,
            "order_date": "2026-08-14T17:39:00.000Z",
            "expected_delivery": null,
            "actual_delivery": null,
            "batches_received": 0,
            "created_by": "Your Admin",
            "created_at": "2026-08-14T17:39:00.000Z"
        }
    ]
}

- Stock In
Request URL
http://localhost:5173/api/v1/stock/in
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "reference_number": "GR-1787118704449",
            "purchase_order_id": 13,
            "purchaseOrder": {
                "id": 13,
                "po_number": "PO-2026-005"
            },
            "supplier": {
                "id": 2,
                "name": "Diebold Nixdorf Tanzania"
            },
            "location": {
                "id": 3,
                "name": "Branch C"
            },
            "receiver": {
                "id": 1,
                "fullName": "Your Admin",
                "email": "admin@example.com"
            },
            "items": [
                {
                    "id": 1,
                    "product_id": 7,
                    "quantity": 100,
                    "unit_price": "80000.00",
                    "product": {
                        "id": 7,
                        "name": "EPP-004-Keyboard",
                        "sku": "SMOKE-SKU-1"
                    }
                },
                {
                    "id": 2,
                    "product_id": 6,
                    "quantity": 20,
                    "unit_price": "20000.00",
                    "product": {
                        "id": 6,
                        "name": "DDR4 4GB RAM",
                        "sku": "SMOKE-001"
                    }
                }
            ],
            "items_count": 2,
            "total_cost": 8400000,
            "status": "RECEIVED",
            "received_by": "Your Admin",
            "received_date": "2026-08-19T05:51:44.000Z",
            "created_at": "2026-08-19T05:51:44.000Z",
            "notes": "Hakuna tatizo",
            "location_id": 3
        }
    ],
    "pagination": {
        "total": 1
    }
}


- Stock Out
Request URL
http://localhost:5173/api/v1/stock/out
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "reference": "REF002",
            "product": "EPP-004-Keyboard",
            "product_id": 7,
            "quantity": 2,
            "location_id": 3,
            "location": "Branch C",
            "purpose": "sale",
            "recipient": "sale",
            "cost_fifo": 200000,
            "issued_by": "Your Admin",
            "issued_at": "2026-08-19T14:23:33.000Z",
            "status": "ISSUED",
            "created_at": "2026-08-19T14:23:33.000Z"
        }
    ],
    "pagination": {
        "total": 1
    }
}

- Transfers
Request URL
http://localhost:5173/api/v1/stock/transfer
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "product": "EPP-004-Keyboard",
            "quantity": 4,
            "from_location": "Branch C",
            "to_location": "Store A",
            "transferred_by": "Your Admin",
            "transferred_at": "2026-08-19T14:27:16.000Z",
            "status": "COMPLETED",
            "notes": "Transferred using FIFO method"
        }
    ],
    "pagination": {
        "total": 1
    }
}

- Damaged
Request URL
http://localhost:5173/api/v1/stock/damage
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin

RESPONSE:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "product": "EPP-004-Keyboard",
            "location": "Branch C",
            "quantity": 1,
            "reason": "IMEMWAGIKIWA NA MAJI",
            "reported_by": "Your Admin",
            "created_at": "2026-08-19T14:29:43.000Z"
        }
    ]
}

- Returns
Request URL
http://localhost:5173/api/v1/stock/return
Request Method
GET
Status Code
304 Not Modified
Remote Address
127.0.0.1:5173
Referrer Policy
strict-origin-when-cross-origin


RESPONSE:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "product": "EPP-004-Keyboard",
            "location": "Unknown",
            "quantity": 4,
            "reason": "HAIWAKI",
            "created_by": "Your Admin",
            "created_at": "2026-08-19T14:53:35.000Z"
        }
    ]
}

And what is it when the finance department has ordered and paid for items eg:ItemA but they have not yet arrived? where are they get recorded or should e just give the status in stockin. What is the best solution here?

------------------------------------------------------


The best solution is **not to put it directly into `stock_in` as if it has arrived**.

You should introduce a separate **Purchase Order / Procurement** workflow.

The key distinction is:

> **Ordered/paid ≠ received ≠ available stock.**

### Recommended flow

```text
Purchase Request
       ↓
Purchase Order
       ↓
Payment / Finance
       ↓
Awaiting Delivery
       ↓
Goods Received
       ↓
Stock In
       ↓
Batch Created
       ↓
Available Inventory
```

For example, Finance orders:

```text
Item A
Quantity: 100
Unit Cost: $2
Total: $200
Supplier: ABC
Payment: PAID
```

But the supplier hasn't delivered yet.

The system should show:

```text
PURCHASE ORDER #PO-001

Item A
Ordered:        100
Received:         0
Remaining:      100

Payment Status: PAID
Delivery Status: PENDING
Inventory:      NOT IN STOCK
```

**Your inventory quantity remains 0.**

---

## Then when 40 arrive

The company receives only 40:

```text
PO-001

Ordered:   100
Received:   40
Remaining:  60
```

The user clicks **Receive Stock**.

The system creates:

```text
STOCK IN #SI-001

Item A
Quantity: 40
```

And creates the actual batch:

```text
B001
40 × $2
```

Inventory becomes:

```text
Available Item A = 40
```

The purchase order remains open:

```text
Ordered:       100
Received:       40
Remaining:      60

Status: PARTIALLY RECEIVED
Payment: PAID
```

---

# Then the remaining 60 arrive

Receive the remaining quantity:

```text
Stock In #SI-002

Item A
Quantity: 60
```

Now:

```text
PO-001

Ordered:       100
Received:      100
Remaining:       0

Payment: PAID
Delivery: COMPLETED
```

And inventory becomes:

```text
B001 → 40 × $2
B002 → 60 × $2
```

Whether those become separate batches or are merged depends on your batch rules; **if they have different receipt dates, conditions, or other batch attributes, keep them separate.**

---

# Why this is better than adding a status to `stock_in`

Because **Stock In means inventory physically entered the company's custody/location**.

If you put a paid-but-not-delivered item into Stock In:

```text
Stock In:
Item A = 100
```

your dashboard would incorrectly say:

> **100 Item A available**

when physically you have:

> **0 Item A**

That can cause serious operational problems.

An engineer might try to request 20 Item A and the system says:

```text
Available: 100
```

but the warehouse actually has none.

---

# You should therefore have 3 separate concepts

### 1. Purchase Order

**What we ordered**

```text
Item A
100 units
$2 each
Supplier ABC
```

### 2. Stock In

**What physically arrived**

```text
40 units received
```

### 3. Stock Balance

**What is physically available**

```text
40 units
```

So:

```text
PURCHASE ORDER
Ordered = 100
        │
        │ 40 received
        ▼
STOCK IN
Received = 40
        │
        ▼
BATCH
40 × $2
        │
        ▼
STOCK BALANCE
Available = 40
```

---

# You can also track payment separately

Since Finance may pay before delivery, I recommend keeping **payment status separate from delivery status**.

For example:

| Purchase | Payment | Delivery | Ordered | Received | Available |
| -------- | ------- | -------- | ------: | -------: | --------: |
| PO-001   | Paid    | Pending  |     100 |        0 |         0 |
| PO-002   | Paid    | Partial  |     100 |       40 |        40 |
| PO-003   | Paid    | Complete |     100 |      100 |       100 |
| PO-004   | Unpaid  | Pending  |      50 |        0 |         0 |

This is much more accurate than having one generic `status`.

---

# Recommended Purchase Order statuses

### Purchase status

```text
DRAFT
SUBMITTED
APPROVED
ORDERED
PARTIALLY_RECEIVED
COMPLETED
CANCELLED
```

### Payment status

```text
UNPAID
PARTIALLY_PAID
PAID
REFUNDED
```

### Delivery status

```text
PENDING
PARTIALLY_RECEIVED
RECEIVED
OVERDUE
CANCELLED
```

These should be independent.

---

# This also gives Finance a very useful dashboard

Finance can see:

### 💰 Paid but not received

```text
PO-001
Item A
100 units
$200
PAID
Not received
```

### 🚚 Partially received

```text
PO-002
Item B
Ordered: 500
Received: 300
Outstanding: 200
```

### 📦 Fully received

```text
PO-003
Item C
Ordered: 100
Received: 100
```

And Stock can see only the inventory that **actually exists**.

---

# Database structure

I would add:

```text
purchase_orders
purchase_order_items
purchase_payments
stock_in
stock_in_items
stock_batches
stock_balances
stock_movements
```

Conceptually:

```text
                    PURCHASE ORDER
                         │
              ┌──────────┴──────────┐
              │                     │
          PAYMENT               DELIVERY
              │                     │
          Finance               Stock In
                                    │
                                    ▼
                                  Batch
                                    │
                                    ▼
                              Stock Balance
```

This is a **much stronger architecture** than trying to make `stock_in.status = pending`.

### One more important benefit

It also handles **partial deliveries, backorders, cancelled orders, over-deliveries, damaged deliveries, and paid-but-never-delivered items** properly.

So for the system we're designing, I strongly recommend:

> **Do not use Stock In to represent items that have merely been ordered or paid for. Create a proper Purchase Order/Procurement module, and only create Stock In when the goods are physically received.**

That separation will make your inventory, Finance reports, FIFO costing, and stock availability much more reliable.

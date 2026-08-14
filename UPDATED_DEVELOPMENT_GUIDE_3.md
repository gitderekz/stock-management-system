Exactly. **`stock_in` is one of the most important parts of the inventory system.** Think of it as the official record of **how stock entered a particular warehouse/store/location**.

### Simple way to think about it

You have:

```text
STOCK IN                         STOCK OUT
    ↓                                ↓
Stock enters the company       Stock leaves the company
    ↓                                ↓
Warehouse increases            Warehouse decreases
```

For example, your company buys 100 Item A:

```text
Supplier: ABC Supplies
Product: Item A
Quantity: 100
Unit Cost: $2
Selling Price: $4
Warehouse: Warehouse A
```

You record a **Stock In**.

The system then creates a batch:

```text
B001
────────────────────
Product: Item A
Quantity: 100
Remaining: 100
Unit Cost: $2
Selling Price: $4
Warehouse: A
```

And inventory becomes:

```text
Warehouse A
Item A = 100
```

---

# Why not just directly increase the product quantity?

Because you would lose **why, when, where and at what price** the stock entered.

Suppose later you buy another 100:

```text
Purchase #001
100 × $2

Purchase #002
100 × $3
```

Your inventory is now:

```text
Item A = 200
```

But internally:

```text
B001 → 100 × $2
B002 → 100 × $3
```

That's extremely important for your FIFO system.

---

# What exactly happens during Stock In?

The workflow should be:

```text
Supplier
   ↓
Purchase
   ↓
Receive Stock
   ↓
STOCK IN
   ↓
Create Batch
   ↓
Increase Stock Balance
   ↓
Create Stock Movement
   ↓
Inventory Updated
```

For example:

```text
Receive 100 Item A
```

The system performs something like:

```text
1. Create Stock-In transaction

2. Create Batch B001

3. Add:
   quantity_received = 100
   quantity_remaining = 100
   unit_cost = $2
   selling_price = $4

4. Increase Warehouse A balance
   Item A = +100

5. Create stock movement:
   type = STOCK_IN
   quantity = 100

6. Record supplier/purchase information

7. Record user who performed the operation

8. Commit transaction
```

---

# Then Stock Out uses that information

Suppose you later issue 30 Item A.

FIFO finds:

```text
B001
100 available
$2 cost
$4 selling price
```

So:

```text
Stock Out
30 × B001
```

Remaining:

```text
B001
70 available
```

The important thing is that the system knows **where those 30 came from**.

---

# Now consider your multiple-price example

You originally asked about:

```text
5 Item A @ $2
8 Item A @ $3
```

The two Stock-In operations could be:

### Stock In #001

```text
Supplier: Supplier A
Product: Item A
Quantity: 5
Unit Cost: $2
Selling Price: $4
Warehouse: A
```

Creates:

```text
B001
5 × $2
Selling @ $4
```

### Stock In #002

A few days later:

```text
Supplier: Supplier B
Product: Item A
Quantity: 8
Unit Cost: $3
Selling Price: $5
Warehouse: A
```

Creates:

```text
B002
8 × $3
Selling @ $5
```

Now:

```text
Warehouse A
────────────────────
Item A

B001 → 5 × $2 → Sell $4
B002 → 8 × $3 → Sell $5

Total = 13
```

That's the foundation that makes your FIFO/manual-batch system possible.

---

# Stock In is also important for auditing

Imagine your manager asks:

> "Where did these 100 Item A units come from?"

The system should be able to show:

```text
Stock In #SI-00045

Supplier:
ABC Supplies

Purchase:
PO-00031

Product:
Item A

Batch:
B001

Quantity:
100

Unit Cost:
$2.00

Selling Price:
$4.00

Warehouse:
Warehouse A

Received:
14 August 2026

Received By:
John

Attachments:
Invoice.pdf
Receipt.jpg
```

So `stock_in` isn't merely a number-increase operation.

It represents the **event of receiving inventory**.

---

# One important design improvement

I would actually structure your system around **three layers**:

```text
PURCHASE
   ↓
STOCK IN
   ↓
BATCH
   ↓
STOCK BALANCE
```

### Purchase

Answers:

> What did we buy?

### Stock In

Answers:

> What did we actually receive into inventory?

### Batch

Answers:

> What exact quantity, cost and selling price does this received stock have?

### Stock Balance

Answers:

> How much do we currently have?

Then:

```text
STOCK BALANCE
      ↓
STOCK OUT
      ↓
BATCH ALLOCATION
      ↓
STOCK MOVEMENT
```

This gives you a very clean audit trail.

---

## In short

Think of `stock_in` as the **door through which inventory enters your system**.

```text
              COMPANY
                 │
       ┌─────────┴─────────┐
       │                   │
    STOCK IN            STOCK OUT
       │                   │
       ▼                   ▼
   Batches              Batch Usage
       │                   │
       ▼                   ▼
 Stock Balance  ←────→  Movements
```

And for your particular system, **every Stock In should normally create one or more batches**, because the batch is what preserves the **cost, selling price, supplier, date, condition, warranty, expiry, serial numbers, and FIFO order** of that inventory.

That is what makes the later stock-out calculations reliable.

Yes. With **FIFO as the default**, but allowing the user to **manually select batches**, the system can handle this very cleanly.

Suppose Warehouse A has:

| Batch     | Available | Unit Cost |
| --------- | --------: | --------: |
| B001      |         5 |        $2 |
| B002      |         8 |        $3 |
| **Total** |    **13** |           |

The user wants to issue **7 × Item A**.

### Scenario 1 — User chooses FIFO

The system automatically consumes the oldest batch first:

```text
B001 → 5 × $2 = $10
B002 → 2 × $3 = $6
```

Therefore:

```text
Issued:
5 from B001
2 from B002

Total issued = 7
Total cost   = $16
```

Remaining inventory:

```text
B001 → 0 × $2
B002 → 6 × $3

Total remaining = 6
Inventory value = $18
```

The stock movement should record **two batch allocations**, not one vague `-7` movement:

```text
ISSUE #1001

Item A
Warehouse A
Quantity: 7

Allocations:
    B001 → 5 × $2 = $10
    B002 → 2 × $3 = $6

Total Cost = $16
```

---

## Scenario 2 — User manually chooses the batch

Suppose the user knows they specifically want to use the newer batch.

They select:

```text
B002 → 7 units
```

The system should allow it **because B002 has 8 available**.

Then:

```text
B001 → 5 × $2
B002 → 1 × $3
```

The issue becomes:

```text
Issued:
7 × $3

Total Cost = $21
```

Remaining:

```text
B001 → 5 × $2 = $10
B002 → 1 × $3 = $3

Total remaining = 6
Inventory value = $13
```

Notice something important here:

### FIFO result

```text
Issued = 7
Cost = $16
Remaining value = $18
```

### Manual batch result

```text
Issued = 7
Cost = $21
Remaining value = $13
```

Both are mathematically correct because **the user deliberately selected a different batch**.

---

# What the UI should look like

When the user clicks **Stock Out**, I'd recommend something like:

```text
┌───────────────────────────────────────────────┐
│              STOCK OUT                        │
├───────────────────────────────────────────────┤
│ Product:     Item A                           │
│ Location:    Warehouse A                      │
│ Quantity:    7                                │
│                                               │
│ Allocation Method:                            │
│                                               │
│   ● FIFO (Recommended)                        │
│   ○ Manual Batch Selection                    │
│                                               │
│ [Continue]                                    │
└───────────────────────────────────────────────┘
```

### If FIFO is selected

The system automatically displays:

```text
┌───────────────────────────────────────────────┐
│ FIFO ALLOCATION                               │
├────────┬───────────┬──────────┬───────────────┤
│ Batch  │ Available │ Issuing  │ Unit Cost     │
├────────┼───────────┼──────────┼───────────────┤
│ B001   │ 5         │ 5        │ $2            │
│ B002   │ 8         │ 2        │ $3            │
├────────┴───────────┴──────────┴───────────────┤
│ Total Issuing: 7                              │
│ Total Cost:    $16                            │
└───────────────────────────────────────────────┘

                    [Confirm Issue]
```

The user doesn't need to manually calculate anything.

---

## If Manual Batch Selection is selected

Show:

```text
┌───────────────────────────────────────────────┐
│ MANUAL BATCH ALLOCATION                       │
├────────┬───────────┬──────────┬───────────────┤
│ Batch  │ Available │ Selected │ Unit Cost     │
├────────┼───────────┼──────────┼───────────────┤
│ B001   │ 5         │ [ 0 ]    │ $2            │
│ B002   │ 8         │ [ 7 ]    │ $3            │
├────────┴───────────┴──────────┴───────────────┤
│ Total Selected: 7                             │
│ Total Cost:    $21                            │
└───────────────────────────────────────────────┘

                    [Confirm Issue]
```

The system should **not allow confirmation until:**

```text
Selected quantities = Requested quantity
```

So if the user requests 7 but selects:

```text
B001 = 3
B002 = 2
```

the system should show:

```text
Requested: 7
Allocated: 5

⚠ Please allocate 2 more items.
```

---

# The database side is important

Don't put this:

```text
stock_out
    product_id = Item A
    quantity = 7
    cost = $16
```

alone.

You need something like:

```text
stock_out
──────────────
id
reference_number
location_id
product_id
quantity
total_cost
issued_by
created_at
```

Then:

```text
stock_out_batch_allocations
────────────────────────────
id
stock_out_id
stock_batch_id
quantity
unit_cost
total_cost
```

For the FIFO example:

```text
stock_out
ID: 1001
Product: Item A
Quantity: 7
Total Cost: $16
```

Allocations:

```text
stock_out_batch_allocations

stock_out_id | batch | qty | unit_cost | total
-------------|-------|-----|-----------|------
1001         | B001  | 5   | $2        | $10
1001         | B002  | 2   | $3        | $6
```

That gives you **complete traceability**.

---

# And this is particularly important for your company

Imagine an engineer is issued:

```text
7 × Item A
```

Later the manager asks:

> "Which stock batches were consumed?"

The system can answer:

```text
Issue #1001

Engineer: John
Project: ATM Installation - Site 23
Warehouse: Warehouse A

B001 → 5 units @ $2 = $10
B002 → 2 units @ $3 = $6

Total = 7 units
Cost = $16
```

And six months later, you still have the exact history.

### So your final inventory rule should be:

**FIFO is the default allocation method.**

**Manual Batch Selection is an optional override.**

But even when manual selection is used, the system must record **exactly which batches were consumed and at what cost**.

That combination gives you both **accounting consistency** and **operational flexibility**.

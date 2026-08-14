Yes. Once you introduce **purchase orders, batches, selling prices, FIFO, finance and reports**, you should also design a proper **pricing and financial calculation layer**. Otherwise taxes, tariffs and margins will eventually create conflicts.

The key principle is:

> **Separate the supplier's purchase cost, landed cost, tax, tariff, selling price, and profit margin. Don't put everything into one `price` field.**

## 1. The overall flow

For an imported item, for example:

```text
Supplier Price
      ↓
+ Shipping
      ↓
+ Insurance
      ↓
+ Customs Duty / Tariff
      ↓
+ Other Import Costs
      ↓
+ Applicable Taxes
      ↓
= LANDed COST
      ↓
+ Desired Profit Margin
      ↓
= Selling Price
```

But there is an important accounting detail:

**Not every tax should necessarily become part of inventory cost.**

For example, recoverable VAT may be treated differently from customs duty or non-recoverable taxes. Therefore, the system should **track each charge separately** and allow the company's accounting rules to determine whether it contributes to inventory cost.

---

# 2. Example

Suppose you purchase:

```text
Item A
Quantity: 100
Supplier price: $20 each
```

Purchase cost:

```text
100 × $20 = $2,000
```

Then you have:

```text
Shipping       $200
Insurance       $50
Customs tariff $300
Other costs     $100
```

Your landed cost before applicable recoverable/non-recoverable tax treatment is:

```text
$2,000
+ $200
+  $50
+ $300
+ $100
───────
$2,650
```

Therefore:

```text
Landed cost per unit = $26.50
```

That is much more useful than simply saying:

```text
Unit Cost = $20
```

because the company actually spent more than $20 to get the goods into inventory.

---

# 3. Tax should be configurable

Don't hard-code something like:

```javascript
tax = price * 0.18
```

Instead, create a tax system.

For example:

```text
Taxes

VAT
18%

Import Duty
10%

Withholding Tax
5%

Other Tax
...
```

Each tax should have properties such as:

```text
name
code
rate
type
applies_to
inclusive/exclusive
recoverable
active
```

---

# 4. Tariffs should be separate from normal taxes

I'd create something like:

```text
tariffs
```

with:

```text
id
name
code
rate
calculation_method
description
active
```

For example:

```text
Import Duty
Rate: 10%
```

Potential calculation methods:

```text
PERCENTAGE
FIXED_AMOUNT
PER_UNIT
```

This is useful because customs charges aren't always simply "18% of price."

---

# 5. Purchase calculation

The Purchase Order should be capable of showing:

```text
Item A
100 × $20
             $2,000
```

Then:

```text
Shipping              $200
Insurance              $50
Import Duty            $300
Other Charges          $100
Tax                    $450
──────────────────────────
Total Purchase Cost  $3,100
```

But internally the system should retain each component separately.

Something like:

```text
purchase_orders
purchase_order_items
purchase_charges
purchase_taxes
purchase_payments
```

---

# 6. Don't put all these values directly into `products`

This is very important.

Don't do this:

```text
products
--------------
price
tax
tariff
shipping
profit
```

because these values can change **per purchase, supplier, shipment, batch and transaction**.

Instead:

```text
Product
   │
   ├── Purchase A
   │      └── Batch A
   │
   ├── Purchase B
   │      └── Batch B
   │
   └── Purchase C
          └── Batch C
```

Each purchase/batch can have its own actual financial data.

---

# 7. Batch should ultimately know its cost

Suppose:

### Batch B001

```text
100 units

Supplier Cost      $20.00
Shipping            $2.00
Insurance           $0.50
Tariff              $3.00
Other Cost          $1.00
────────────────────────
Landed Cost        $26.50
```

Then:

```text
B001

Quantity: 100
Unit Cost: $20.00
Unit Landed Cost: $26.50
```

This is extremely useful for FIFO.

---

# 8. Then selling price

Suppose management wants:

```text
Profit Margin = 25%
```

You need to define exactly what "25%" means.

There are two common interpretations.

### Markup

```text
Selling Price = Cost × (1 + 25%)
```

If cost is $26.50:

```text
$26.50 × 1.25
= $33.125
```

Selling price ≈:

```text
$33.13
```

### Margin

If they mean a **25% gross margin on selling price**:

```text
Selling Price = Cost / (1 - 25%)
```

Therefore:

```text
$26.50 / 0.75
= $35.33
```

Those are **not the same thing**.

Your system should explicitly distinguish:

```text
MARKUP %
GROSS MARGIN %
```

---

# 9. I strongly recommend supporting pricing rules

Create something like:

```text
pricing_rules
```

Example:

```text
Pricing Rule: Standard Equipment

Cost Basis:
LANDED_COST

Method:
MARGIN

Target Margin:
25%
```

Then the system calculates:

```text
Landed Cost = $26.50

Target Margin = 25%

Selling Price = $35.33
```

The user should still be able to override the automatically calculated selling price if they have permission.

---

# 10. Your batch could therefore look like this

```text
B001
────────────────────────────
Product: Item A
Quantity: 100

Supplier Cost:       $20.00
Shipping:             $2.00
Insurance:            $0.50
Tariff:               $3.00
Other Costs:          $1.00

Landed Cost:         $26.50

Target Margin:          25%

Selling Price:       $35.33
────────────────────────────
```

That is much more powerful than simply:

```text
Item A = $20
```

---

# 11. Now FIFO becomes even more powerful

Suppose:

```text
B001 → 5 units
Landed Cost = $26.50
Selling = $35.33

B002 → 8 units
Landed Cost = $31.00
Selling = $40.00
```

You issue 7 using FIFO:

```text
B001 → 5
B002 → 2
```

The system calculates:

```text
Cost:

5 × $26.50 = $132.50
2 × $31.00 = $62.00

Total Cost = $194.50
```

Selling value:

```text
5 × $35.33 = $176.65
2 × $40.00 = $80.00

Revenue = $256.65
```

Gross profit:

```text
$256.65 - $194.50
= $62.15
```

The system can therefore tell Finance **exactly how profitable that particular stock issue was**.

---

# 12. Tax on the selling side

You also need to distinguish:

```text
Selling Price
+
Sales Tax/VAT
=
Customer Total
```

For example:

```text
Selling price       $35.33
VAT 18%               $6.36
──────────────────────────
Customer pays        $41.69
```

Do **not** treat the $41.69 as your revenue if the $6.36 is tax collected on behalf of the government.

Your financial reporting should distinguish:

```text
Net Sales
Sales Tax
Gross Invoice Amount
Cost of Goods Sold
Gross Profit
```

---

# 13. So your sales/stock-out record should be richer

Instead of:

```text
stock_out
--------------
quantity
price
```

have transaction-level values such as:

```text
quantity
unit_cost
unit_landed_cost
unit_selling_price

subtotal
discount
tax
total

total_cost
gross_profit
margin_percentage
```

And, importantly, the **batch allocation table** should snapshot the relevant cost and selling-price values.

---

# 14. Discounts

Also include discounts.

For example:

```text
Selling Price        $1,000
Discount               $100
──────────────────────────
Net Selling Price      $900
VAT                    $162
──────────────────────────
Customer Total       $1,062
```

Track:

```text
discount_type
discount_value
discount_amount
```

Support:

```text
PERCENTAGE
FIXED
```

---

# 15. Different customers may have different prices

Since you want this to be generic, consider supporting:

```text
Standard Price
Wholesale Price
Corporate Price
Government Price
Project Price
Special Price
```

But don't overcomplicate the first version.

A good architecture is:

```text
Product
   ↓
Default Selling Price

Batch
   ↓
Batch Selling Price

Price List
   ↓
Customer/Business-specific Price
```

---

# 16. Important: Stock OUT doesn't necessarily mean "sale"

Your system is for an ATM/maintenance company, so this is particularly important.

Stock can leave a warehouse because of:

```text
SALE
PROJECT_ISSUE
ENGINEER_ISSUE
CONSUMPTION
TRANSFER
REPAIR
REPLACEMENT
CUSTOMER_DEPLOYMENT
DAMAGE
LOSS
```

Therefore don't call everything a "sale."

For example, an engineer receives:

```text
5 cables
```

for an ATM installation.

That's:

```text
STOCK OUT
Purpose = PROJECT ISSUE
```

It may have a cost but **no selling price/revenue**.

Therefore your stock-out model should support:

```text
movement_type
```

and financial treatment based on that type.

---

# 17. This is the financial architecture I recommend

```text
                     PRODUCT
                        │
                        ▼
                  PURCHASE ORDER
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
       Supplier      Taxes          Tariffs
          │             │              │
          └─────────────┼──────────────┘
                        ▼
                    STOCK IN
                        │
                        ▼
                      BATCH
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        LANDed COST           SELLING PRICE
             │                     │
             └──────────┬──────────┘
                        ▼
                   STOCK OUT
                        │
                        ▼
                 BATCH ALLOCATION
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           COST      REVENUE     TAX
             │          │          │
             └──────────┼──────────┘
                        ▼
                  GROSS PROFIT
```

---

# 18. Tables I'd add to your system

In addition to the tables from the previous design:

```text
purchase_orders
purchase_order_items

purchase_charges
purchase_taxes
purchase_payments

taxes
tariffs

pricing_rules
price_lists
price_list_items

stock_batches

stock_out
stock_out_items
stock_out_batch_allocations

sales_taxes
discounts
```

You don't necessarily need all of these in the first MVP, but the architecture should leave room for them.

---

# 19. One more critical distinction: "cost" vs "landed cost"

I would update the specification we created earlier to use **both**:

```text
unit_purchase_cost
unit_landed_cost
selling_price
```

For example:

```text
B001

Purchase Cost: $20.00
Landed Cost:   $26.50
Selling Price: $35.33
```

Why?

Because Finance may want to know:

> "How much did the supplier charge us?"

while inventory accounting wants to know:

> "How much did it actually cost us to get this inventory ready for use/sale?"

Those are different questions.

---

## Final recommended model

For your system, I'd structure the financial side as:

```text
PURCHASE PRICE
     ↓
PURCHASE CHARGES
     ↓
TARIFFS
     ↓
TAXES
     ↓
LANDED COST
     ↓
PRICING RULE
     ↓
SELLING PRICE
     ↓
STOCK OUT
     ↓
BATCH ALLOCATION
     ↓
┌─────────────────────┐
│ Cost                │
│ Revenue             │
│ Tax                 │
│ Discount            │
│ Gross Profit        │
│ Gross Margin %      │
└─────────────────────┘
```

And **do not automatically assume every tax/tariff becomes inventory cost**. Store them separately and configure whether each charge is **capitalized into inventory cost, recoverable, or treated as an expense**, because that distinction matters for proper financial reporting and can depend on the company's accounting/tax rules.

For the development guide, I would therefore add a dedicated **Procurement + Tax/Tariff + Landed Cost + Pricing + Profitability module** rather than trying to bolt these onto `stock_in`.

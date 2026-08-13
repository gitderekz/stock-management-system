# COMPLETE STOCK, ASSET & INVENTORY MANAGEMENT SYSTEM — DEVELOPMENT SPECIFICATION

## 1. PROJECT OBJECTIVE

Develop a complete, production-ready **Stock, Inventory, Asset and Stock-Movement Management System** for a company whose primary business involves:

* ATM installation
* ATM maintenance
* ATM repairs
* ATM technical support
* ATM spare-parts management
* Field engineering
* Equipment deployment
* Equipment recovery
* Equipment transfers
* Equipment tracking

However, **DO NOT hard-code the application around ATMs**.

The system must be designed as a **generic business inventory/stock management platform** capable of being used by:

* ATM companies
* IT companies
* Hardware companies
* Electrical companies
* Construction companies
* Warehouses
* Retail businesses
* Service companies
* Manufacturing businesses
* Equipment rental businesses
* Any organization managing products, equipment, spare parts, assets, stock, purchases, transfers and consumption.

ATM-related examples may be used as seed/sample data, but the underlying architecture must remain completely generic.

---

# 2. TECHNOLOGY STACK

## Backend

Use:

* Node.js
* Express.js
* Sequelize ORM
* MySQL
* JWT authentication
* Multer for file uploads
* WebSocket for realtime communication
* SMTP for email
* bcrypt/argon2 for password hashing
* dotenv for environment configuration
* Helmet for HTTP security headers
* CORS
* Rate limiting
* Input validation
* Proper centralized error handling

## Frontend

Use:

* React.js
* React Router
* Modern React functional components
* Hooks
* Axios or equivalent HTTP client
* WebSocket client
* Responsive CSS/UI framework of your choice
* Reusable components
* Modal/dialog components
* Toast/notification system
* Charting library for dashboard statistics

## Database

MySQL.

Use Sequelize for:

* Models
* Relationships
* Queries
* Transactions
* Constraints
* Associations
* Migrations where appropriate

DO NOT use raw SQL unnecessarily.

---

# 3. EXISTING DATABASE — VERY IMPORTANT

The MySQL database already exists and is used by other systems.

Existing environment:

```env
NODE_ENV=development

PORT=3000

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=test
DB_PORT=3306
DB_DIALECT=mysql

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

CONTACTFORM_SMTP_HOSTNAME=smtp.gmail.com
CONTACTFORM_SMTP_PORT=465
CONTACTFORM_SMTP_USERNAME=xxxx@gmail.com
CONTACTFORM_SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

### CRITICAL DATABASE RULES

1. DO NOT drop the existing database.
2. DO NOT delete existing tables.
3. DO NOT reset the database.
4. DO NOT modify unrelated tables belonging to other systems.
5. Inspect the existing database schema before creating anything.
6. Reuse compatible existing tables where appropriate.
7. If a required table does not exist, create it safely.
8. If existing tables conflict with the required architecture, document the conflict before making destructive changes.
9. Never use `sequelize.sync({ force: true })`.
10. Never automatically destroy production/existing data.
11. Use migrations for schema changes where possible.
12. Preserve existing data and relationships.
13. The application must be capable of coexisting with other systems using the same database.

Before implementation, inspect:

* Existing tables
* Existing columns
* Existing primary keys
* Existing foreign keys
* Existing indexes
* Existing constraints
* Existing users
* Existing roles
* Existing product/inventory tables if any

Create a compatibility strategy before changing anything.

---

# 4. APPLICATION ARCHITECTURE

Use a clean layered architecture.

Recommended backend structure:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── migrations/
│   ├── seeders/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── websocket/
│   ├── utils/
│   ├── jobs/
│   ├── constants/
│   └── app.js
├── uploads/
├── logs/
├── .env
└── package.json
```

Frontend:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── contexts/
│   ├── services/
│   ├── api/
│   ├── routes/
│   ├── utils/
│   ├── i18n/
│   ├── assets/
│   └── App.jsx
├── public/
└── package.json
```

Separate:

* UI logic
* API logic
* business logic
* database logic
* authentication
* authorization
* validation
* file handling
* WebSocket handling

Do not put everything inside controllers.

---

# 5. AUTHENTICATION

Implement secure authentication using JWT.

Features:

* Login
* Logout
* Current user/session
* Password hashing
* Password change
* Forgot password
* Password reset
* Account activation/deactivation
* Session/token expiration
* Protected routes
* Automatic unauthorized handling

JWT should contain only necessary information.

Never store plain-text passwords.

Never return password hashes through APIs.

---

# 6. USER ROLES

Implement these roles:

```text
admin
engineer
finance
manager
reception
hr
project-manager
stock
```

Use proper role-based access control.

### Role responsibilities

#### ADMIN

Full system access.

Can:

* Manage users
* Manage roles/permissions
* Manage products
* Manage stock
* Manage suppliers
* Manage categories
* Manage brands
* Manage warehouses
* Manage locations
* View reports
* View logs
* Manage settings
* Configure system
* Override stock operations
* Approve/reject operations where permitted

#### STOCK

Can:

* Manage products
* Receive stock
* Issue stock
* Transfer stock
* Adjust stock
* Record damaged stock
* View inventory
* Manage suppliers
* Manage categories
* Manage brands
* View stock reports

#### ENGINEER

Can:

* View assigned stock
* Request equipment/spare parts
* Receive issued equipment
* Return unused items
* Report damaged items
* Consume spare parts
* View assigned equipment
* View relevant stock history

Engineers must NOT automatically have unrestricted inventory management.

#### FINANCE

Can:

* View purchase information
* View supplier information
* View stock valuation
* View costs
* View financial reports
* Manage purchase-related financial information where authorized

#### MANAGER

Can:

* View dashboards
* View reports
* Monitor inventory
* Approve operations where configured
* View users and activities
* Monitor departments

#### PROJECT MANAGER

Can:

* Manage projects
* Assign engineers
* Request equipment
* Track project stock utilization
* View project-related stock

#### RECEPTION

Can:

* View relevant records
* Register requests
* View basic inventory information where authorized
* Handle reception-related workflows

#### HR

Can:

* Manage employees/users where authorized
* View employee-related information
* Monitor engineer assignments where necessary

Do not rely only on frontend role checks.

Every sensitive API endpoint must enforce authorization on the backend.

---

# 7. PERMISSION SYSTEM

Do not hard-code every permission directly into controllers.

Implement a flexible permission system.

Example:

```text
products.view
products.create
products.update
products.delete

stock.receive
stock.issue
stock.transfer
stock.adjust
stock.damage
stock.view

suppliers.view
suppliers.create
suppliers.update
suppliers.delete

reports.view
users.manage
settings.manage
logs.view
```

Allow roles to have multiple permissions.

Admin should be able to manage permissions.

---

# 8. CORE INVENTORY CONCEPT

The most important architectural requirement is:

## CURRENT STOCK AND STOCK HISTORY ARE NOT THE SAME THING.

Never treat stock as only one number.

The system must maintain a **stock movement ledger**.

Every stock change must create a stock movement.

Examples:

```text
PURCHASE
SALE
ISSUE
RETURN
TRANSFER_IN
TRANSFER_OUT
DAMAGE
LOSS
ADJUSTMENT_IN
ADJUSTMENT_OUT
CONSUMPTION
RECOVERY
```

Never silently modify inventory without creating a corresponding movement record.

---

# 9. STOCK EXAMPLE

Suppose:

```text
Product: ATM Receipt Printer
Initial purchase = 100
```

Current stock:

```text
100
```

All 100 are issued/consumed:

```text
Current stock = 0
Total purchased = 100
```

Later another 100 are purchased.

The system must show:

```text
Total purchased = 200
Current stock = 100
```

It must NOT overwrite the original purchase.

The transaction history should contain:

```text
PURCHASE +100
ISSUE    -100
PURCHASE +100
```

Therefore:

```text
Total Purchased = 200
Total Issued = 100
Current Stock = 100
```

Historical stock movements must never be lost.

---

# 10. DAMAGED STOCK

Damaged items must be tracked separately.

Example:

```text
Current stock = 100
Damaged = 5
```

Create:

```text
DAMAGE
quantity = 5
```

Then:

```text
Current stock = 95
Total damaged = 5
```

The system must retain:

* Product
* Quantity
* Date/time
* User
* Location
* Reason
* Description
* Attachments/photos
* Related transaction

Do NOT simply delete damaged items.

---

# 11. MULTIPLE WAREHOUSES / STORES

The system must support multiple inventory locations.

Create concepts such as:

```text
locations
warehouses
stores
branches
```

A generic `locations` model is preferred.

Example:

```text
Warehouse Dar es Salaam
Warehouse Arusha
Store Mwanza
Store Dodoma
```

Stock belongs to a location.

Example:

```text
Product A

Warehouse A = 100
Warehouse B = 50
Store C = 25

Total = 175
```

The product itself should not contain the authoritative current stock quantity.

Stock quantity should be calculated/maintained per:

```text
product + location
```

---

# 12. STOCK TRANSFERS

Implement stock transfers.

Example:

```text
Warehouse A
100 units

Transfer 20 to Store A
```

Result:

```text
Warehouse A = 80
Store A = 20
```

The system must create:

```text
TRANSFER_OUT
TRANSFER_IN
```

linked by a common transfer reference.

Never simply change both quantities without a transaction history.

Transfers should support:

* Source location
* Destination location
* Product
* Quantity
* Requested by
* Approved by
* Date
* Status
* Notes
* Attachments

Statuses:

```text
PENDING
APPROVED
REJECTED
IN_TRANSIT
COMPLETED
CANCELLED
```

---

# 13. PRODUCTS

Create a complete product management module.

Product fields should support:

* ID
* SKU
* Product name
* Description
* Category
* Brand/maker
* Model
* Version
* Product code
* Serial number
* Barcode
* Unit of measurement
* Purchase price
* Selling/issue price
* Condition
* Product type
* Minimum stock level
* Maximum stock level
* Reorder level
* Warranty information
* Status
* Images
* Videos
* Attachments
* Created by
* Updated by
* Created at
* Updated at

Conditions:

```text
NEW
USED
DAMAGED
REFURBISHED
```

Product types:

```text
CONSUMABLE
EQUIPMENT
SPARE_PART
ASSET
TOOL
OTHER
```

---

# 14. SERIALIZED VS NON-SERIALIZED PRODUCTS

The system must support both.

### Serialized item

Example:

```text
ATM
Serial Number: ATM123456
```

Each physical unit must be individually tracked.

### Non-serialized item

Example:

```text
Screws
Quantity: 500
```

Track quantity without requiring individual serial numbers.

The product configuration should specify whether serial tracking is required.

---

# 15. PRODUCT IMAGES, VIDEOS AND ATTACHMENTS

Support:

* Images
* Short videos
* PDF
* Word documents
* Excel files
* Receipts
* Invoices
* Warranty documents
* Other relevant documents

Use Multer.

Store uploaded files under:

```text
backend/uploads/
```

Do not store large binary files directly inside MySQL unless there is a strong reason.

Store metadata in the database.

Example:

```text
attachments
```

fields:

```text
id
entity_type
entity_id
file_name
file_path
mime_type
file_size
uploaded_by
created_at
```

Validate:

* MIME type
* File extension
* File size
* Filename
* Upload permissions

Prevent malicious file uploads.

---

# 16. REQUIRED DATABASE TABLES

At minimum design appropriate tables for:

```text
users
roles
permissions
role_permissions

products
product_images
product_videos
product_attachments

brands
categories
units

suppliers
supplier_contacts

locations
warehouses
branches

stock_balances
stock_movements

stock_in
stock_in_items

stock_out
stock_out_items

stock_transfers
stock_transfer_items

stock_adjustments
stock_adjustment_items

damaged_stock

serial_numbers

purchase_orders
purchase_order_items

projects
project_stock
project_stock_requests

engineer_assignments

notifications

system_logs
login_logs

settings

attachments
```

Add any other tables required for proper normalization and business functionality.

Do not create unnecessary duplicate tables.

---

# 17. STOCK IN

Implement a complete stock receiving workflow.

Example:

```text
Supplier
    ↓
Purchase/Receiving
    ↓
Stock In
    ↓
Location
    ↓
Inventory Updated
```

Stock-in record should contain:

* Supplier
* Purchase/reference number
* Receipt/invoice
* Date
* Location
* User
* Notes
* Total cost
* Attachments

Items:

* Product
* Quantity
* Unit price
* Condition
* Batch number where applicable
* Serial numbers where applicable
* Warranty information

When completed:

```text
stock_balances += quantity
```

and create stock movement records.

---

# 18. STOCK OUT

Implement stock issuing.

Stock-out may represent:

* Sale
* Engineer issue
* Project issue
* Internal consumption
* Maintenance use
* Customer deployment
* Other usage

Record:

* Destination
* Recipient
* Engineer
* Project
* Purpose
* Product
* Quantity
* Serial number if applicable
* Date
* User
* Notes
* Attachments

Before issuing:

```text
requested quantity <= available quantity
```

Never allow negative stock unless an explicit system setting permits it.

---

# 19. STOCK RETURNS

Implement returns.

Examples:

Engineer receives:

```text
10 spare parts
```

Uses:

```text
7
```

Returns:

```text
3
```

The system must track:

```text
Issued = 10
Consumed = 7
Returned = 3
```

Returned items should return to the appropriate location after validation.

---

# 20. ENGINEER / FIELD OPERATIONS

Because this system is designed for ATM installation and maintenance, support field operations.

Engineers can be assigned:

* Projects
* Sites
* Customers
* Equipment
* Spare parts
* Tools

Example:

```text
Project: ATM Installation - Site X

Engineer: John

Issued:
1 ATM
2 receipt printers
5 cables
10 screws
```

Track:

```text
Issued
Used
Returned
Damaged
Lost
```

This should integrate with stock movements.

---

# 21. PROJECT MANAGEMENT

Create a lightweight project module.

Projects:

* Project number
* Name
* Description
* Customer
* Site
* Start date
* End date
* Status
* Project manager
* Engineers
* Attachments

Project stock utilization:

```text
Project
   ↓
Requested Stock
   ↓
Approved
   ↓
Issued
   ↓
Used
   ↓
Returned / Damaged
```

---

# 22. DASHBOARD

Create a professional dashboard.

Display:

### Inventory statistics

* Total products
* Total stock quantity
* Total inventory value
* Low-stock products
* Out-of-stock products
* Damaged items
* Products by condition
* Products by category
* Products by location

### Movement statistics

* Stock received today
* Stock issued today
* Transfers today
* Damaged today
* Recent movements

### Charts

Include useful charts such as:

* Stock movement over time
* Stock by category
* Stock by location
* Inventory value
* Top issued products
* Low-stock products

Dashboard data must respect user permissions.

---

# 23. STOCK LISTING PAGE

Create a highly usable stock/product listing page.

Display:

* Product image
* Product name
* SKU
* Description
* Brand
* Category
* Model
* Version
* Serial number
* Condition
* Quantity
* Location
* Price
* Status
* Attachments

Provide:

* Search
* Filtering
* Sorting
* Pagination
* Column visibility where useful
* Export
* View details
* Edit
* Delete where permitted
* Stock history
* Stock movement history

Do not load thousands of records unnecessarily.

Use server-side pagination.

---

# 24. PRODUCT DETAILS PAGE

Display complete information.

Sections:

```text
General Information
Images/Videos
Specifications
Stock by Location
Serial Numbers
Purchase History
Stock Movement History
Damage History
Transfer History
Attachments
Project Usage
Audit History
```

---

# 25. STOCK MOVEMENT HISTORY

Every product must have a complete timeline.

Example:

```text
11 Aug
PURCHASE +100
Warehouse A

15 Aug
ISSUE -20
Engineer John

17 Aug
DAMAGE -5
Warehouse A

20 Aug
TRANSFER -30
Warehouse A → Store B
```

Allow filtering by:

* Date
* User
* Location
* Movement type
* Project
* Engineer
* Supplier

---

# 26. SUPPLIERS

Supplier management:

* Name
* Company
* Phone
* Email
* Address
* Tax information
* Contact person
* Notes
* Status
* Attachments

Show:

* Purchase history
* Total purchased
* Products supplied

---

# 27. CATEGORIES

Implement category management.

Support hierarchical categories if useful:

```text
ATM Equipment
    ├── ATM Machines
    ├── Card Readers
    ├── Receipt Printers
    └── Keyboards

Networking
    ├── Routers
    ├── Switches
    └── Cables
```

---

# 28. BRANDS / MAKERS

Manage:

* Brand name
* Description
* Logo
* Website
* Status

Example:

```text
NCR
Diebold Nixdorf
GRG
Cisco
Dell
HP
```

Do not hard-code these brands.

---

# 29. NOTIFICATIONS

Implement a notification system.

Notifications may be triggered by:

* Low stock
* Out of stock
* Stock transfer
* Stock request
* Approval request
* Damaged stock
* New user
* Password reset
* System events

Support:

* In-app notifications
* Email notifications where appropriate

---

# 30. REALTIME STOCK UPDATES

Use WebSocket.

When a stock movement occurs:

```text
User A receives stock
        ↓
Backend updates database
        ↓
WebSocket event emitted
        ↓
Other connected users receive update
        ↓
Dashboard/list refreshes automatically
```

Example event:

```text
stock:movement
```

Payload:

```json
{
  "productId": 123,
  "locationId": 2,
  "movementType": "PURCHASE",
  "quantity": 100,
  "currentStock": 250
}
```

Do not require users to manually refresh the page to see important stock changes.

---

# 31. EMAIL

Use SMTP configuration from `.env`.

Support:

* Password reset
* Account notifications
* Low-stock alerts
* Approval notifications
* Stock transfer notifications
* System notifications

Create a reusable email service.

Never hard-code SMTP credentials.

---

# 32. SYSTEM SETTINGS

Create settings management.

Required settings:

```text
system_name
logo
favicon
default_color
smtp_hostname
smtp_email
smtp_port
smtp_username
smtp_password
timezone
default_language
currency
date_format
```

Additional settings may be added.

Sensitive settings must only be accessible to authorized administrators.

---

# 33. THEME

Implement:

* Light mode
* Dark mode
* System preference mode
* Custom theme color
* Company logo
* Responsive UI

The selected theme should persist.

---

# 34. LOCALIZATION

Implement multilingual architecture.

Do NOT hard-code all text directly into components.

Use translation files.

Example:

```text
i18n/
├── en.json
├── sw.json
```

Initially provide:

* English
* Swahili

Make adding additional languages easy.

---

# 35. SEARCH / FILTER / PAGINATION

All large datasets must support server-side:

* Search
* Pagination
* Sorting
* Filtering

Examples:

```text
/products?page=1&limit=20&search=printer
```

Support filters such as:

* Category
* Brand
* Condition
* Location
* Status
* Stock level
* Date range

---

# 36. MODALS

Use popup modals for:

* Add
* Edit
* Delete confirmation
* Stock in
* Stock out
* Transfer
* Damage
* Return
* Approve
* Reject
* Assign
* View quick details

For complex records, use full pages where a modal would become too large.

Before destructive operations, always show a confirmation.

Example:

```text
Are you sure you want to delete this product?

This action cannot be undone.
```

For sensitive stock operations, require explicit confirmation.

---

# 37. AUDIT LOGGING

Implement comprehensive audit logging.

Record:

* Login
* Logout
* Create
* Update
* Delete
* Stock in
* Stock out
* Transfer
* Damage
* Adjustment
* Return
* Permission changes
* Settings changes

Log:

```text
user_id
action
entity
entity_id
old_values
new_values
IP address
user agent
timestamp
```

Never allow ordinary users to modify audit logs.

---

# 38. STOCK INTEGRITY

Use database transactions for operations affecting multiple records.

For example:

```text
Transfer 20 units:

BEGIN TRANSACTION

Decrease source stock
Create TRANSFER_OUT
Create transfer record
Increase destination stock
Create TRANSFER_IN

COMMIT
```

If any operation fails:

```text
ROLLBACK
```

No partial stock updates.

Prevent:

* Negative stock
* Duplicate stock transactions
* Duplicate serial numbers
* Invalid transfers
* Invalid quantities
* Unauthorized adjustments
* Concurrent stock corruption

Use appropriate database locking/transaction isolation where necessary.

---

# 39. CONCURRENCY

This is important.

Two users may attempt:

```text
User A issues 80
User B issues 50
```

while only:

```text
100
```

are available.

The system must prevent both transactions from successfully consuming stock if that would result in negative inventory.

Use:

* Database transactions
* Row-level locking where supported
* Atomic updates
* Validation inside the transaction

Do not rely only on frontend validation.

---

# 40. SECURITY

Implement strong security.

Requirements:

* Password hashing
* JWT authentication
* Role/permission authorization
* Helmet
* CORS configuration
* Rate limiting
* Input validation
* SQL injection protection through Sequelize
* XSS prevention
* Secure file uploads
* File type validation
* File size limits
* Authentication throttling
* Secure password reset
* No sensitive information in logs
* No password hashes in API responses
* Environment variables for secrets
* Proper HTTP status codes

Protect against:

* Unauthorized access
* IDOR
* Privilege escalation
* Malicious uploads
* Token abuse
* Brute-force login
* SQL injection
* XSS
* CSRF where applicable

---

# 41. API DESIGN

Create RESTful APIs.

Example:

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/categories
POST   /api/categories

GET    /api/brands
POST   /api/brands

GET    /api/suppliers
POST   /api/suppliers

GET    /api/locations
POST   /api/locations

GET    /api/stock
POST   /api/stock/in
POST   /api/stock/out
POST   /api/stock/transfer
POST   /api/stock/damage
POST   /api/stock/return
GET    /api/stock/movements

GET    /api/dashboard
GET    /api/reports
GET    /api/notifications
```

Use consistent API responses.

Example:

```json
{
  "success": true,
  "message": "Stock received successfully",
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Insufficient stock",
  "errors": []
}
```

---

# 42. VALIDATION

Validate both:

### Frontend

For user experience.

### Backend

For actual security and data integrity.

Never trust frontend validation.

Validate:

* Required fields
* Numbers
* Quantities
* Emails
* Dates
* IDs
* File uploads
* Permissions
* Stock availability

---

# 43. REPORTS

Implement reports for:

### Inventory

* Current stock
* Stock valuation
* Low stock
* Out of stock
* Damaged stock
* Stock by location

### Movement

* Stock received
* Stock issued
* Stock transferred
* Stock damaged
* Stock returned
* Stock adjusted

### Purchase

* Purchases by supplier
* Purchases by date
* Purchase value
* Product purchase history

### Usage

* Product consumption
* Engineer usage
* Project usage
* Location usage

Allow:

* Date filtering
* Export to CSV/Excel where practical
* Print-friendly views

---

# 44. USER INTERFACE

The UI must be:

* Professional
* Modern
* Clean
* Responsive
* Mobile-friendly
* Tablet-friendly
* Desktop-friendly
* Accessible
* Fast

Use:

* Sidebar navigation
* Top navigation
* Breadcrumbs
* Cards
* Tables
* Charts
* Modals
* Toast notifications
* Loading states
* Skeleton loaders
* Empty states
* Error states

Avoid clutter.

---

# 45. RESPONSIVE DESIGN

The application must adapt to:

```text
Mobile
Tablet
Laptop
Desktop
Large monitors
```

Tables should become usable on small screens.

Do not create fixed-width layouts that break mobile devices.

---

# 46. ERROR HANDLING

Implement centralized error handling.

Frontend should gracefully handle:

* 400
* 401
* 403
* 404
* 409
* 422
* 429
* 500

Display useful user-friendly messages.

Do not expose internal stack traces to normal users.

---

# 47. LOADING / EMPTY STATES

Every asynchronous page must have:

* Loading state
* Empty state
* Error state
* Retry option where appropriate

Example:

```text
No products found.

Try changing your search or filters.
```

---

# 48. DATA INTEGRITY RULES

Implement database constraints where appropriate.

Examples:

* Unique SKU
* Unique serial number where required
* Valid foreign keys
* Valid quantities
* Valid role relationships
* Valid location relationships

Use indexes for frequently searched fields.

---

# 49. SEED DATA

Create safe development seed data.

Include:

Roles:

```text
admin
engineer
finance
manager
reception
hr
project-manager
stock
```

Example categories:

```text
ATM Equipment
Networking
Computer Hardware
Spare Parts
Tools
Consumables
```

Example products:

```text
ATM Machine
Receipt Printer
Card Reader
Network Router
Ethernet Cable
UPS
```

Do not insert sample data automatically into an existing production database.

Provide a separate explicit seed command.

---

# 50. DATABASE MIGRATIONS

Create proper Sequelize migrations.

Never rely on:

```javascript
sequelize.sync({ force: true })
```

Prefer:

```text
migration:create
migration:up
migration:down
```

Document how migrations should be executed safely.

---

# 51. ENVIRONMENT CONFIGURATION

Create:

```text
.env.example
```

Do not commit real credentials.

Example:

```env
NODE_ENV=development

PORT=3000

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=test
DB_PORT=3306
DB_DIALECT=mysql

JWT_SECRET=
JWT_EXPIRE=7d

CONTACTFORM_SMTP_HOSTNAME=smtp.gmail.com
CONTACTFORM_SMTP_PORT=465
CONTACTFORM_SMTP_USERNAME=
CONTACTFORM_SMTP_PASSWORD=
```

---

# 52. DOCUMENTATION

Create:

```text
README.md
API_DOCUMENTATION.md
DATABASE.md
DEPLOYMENT.md
SECURITY.md
```

Document:

* Installation
* Environment variables
* Database setup
* Migrations
* Seeders
* Running backend
* Running frontend
* Production deployment
* WebSocket configuration
* File uploads
* SMTP setup
* Authentication
* Role permissions
* Backup recommendations

---

# 53. BACKUP / RECOVERY CONSIDERATIONS

The system must be designed so database backups can be performed safely.

Do not implement destructive maintenance commands without explicit confirmation.

Document recommended backup procedures.

---

# 54. PERFORMANCE

Optimize for large datasets.

Use:

* Pagination
* Database indexes
* Efficient Sequelize queries
* Selective attributes
* Eager loading only when needed
* Lazy loading where appropriate
* Caching where beneficial
* WebSocket events instead of unnecessary polling

Do not retrieve the entire product table just to display 20 products.

---

# 55. STOCK CALCULATION

The system should support reliable stock calculations.

Conceptually:

```text
Current Stock =
Purchases
+ Transfers In
+ Returns
+ Positive Adjustments
- Sales
- Issues
- Transfers Out
- Damage
- Loss
- Consumption
- Negative Adjustments
```

For performance, maintain a `stock_balances` table containing current quantity per:

```text
product
+
location
```

But the authoritative historical record remains:

```text
stock_movements
```

Every balance update must correspond to a movement.

---

# 56. STOCK MOVEMENT TYPES

Create an enum/constants structure:

```text
PURCHASE
SALE
ISSUE
RETURN
TRANSFER_IN
TRANSFER_OUT
DAMAGE
LOSS
CONSUMPTION
ADJUSTMENT_IN
ADJUSTMENT_OUT
RECOVERY
```

Do not allow arbitrary movement types from the frontend.

---

# 57. STOCK VALUATION

Support inventory valuation.

At minimum track:

```text
quantity
unit_cost
total_cost
```

Design the system so FIFO/weighted-average valuation can be introduced later.

Do not incorrectly calculate inventory value using selling price.

---

# 58. SERIAL NUMBER TRACKING

For serialized equipment:

```text
Product
    ↓
Serial Number
    ↓
Location
    ↓
Status
    ↓
Assignment
```

Serial number statuses could include:

```text
IN_STOCK
ASSIGNED
IN_USE
UNDER_REPAIR
DAMAGED
LOST
RETURNED
RETIRED
```

Allow viewing the complete lifecycle of a serialized item.

---

# 59. SEARCH BY SERIAL NUMBER

Provide a global search capability.

A user should be able to search:

```text
ATM123456
```

and immediately see:

* Product
* Model
* Current location
* Current status
* Assignment
* Engineer
* Project
* Purchase information
* Movement history
* Repair/maintenance history where available

---

# 60. FUTURE EXTENSIBILITY

Design the system so future modules can be added without rewriting the architecture.

Potential future modules:

```text
Customers
Tickets
Maintenance
ATM Installations
Service Calls
Work Orders
Contracts
Projects
Purchasing
Sales
Invoices
Payments
Assets
Vehicle Management
Field Service
CRM
```

Do not tightly couple inventory logic to ATM terminology.

For example, use:

```text
products
assets
locations
projects
stock_movements
```

rather than:

```text
atm_parts
atm_stock
atm_machines
```

unless a specific ATM module is introduced later.

---

# 61. FRONTEND PAGES

At minimum implement:

```text
/login

/dashboard

/products
/products/:id

/categories
/brands
/suppliers

/locations
/warehouses

/stock
/stock/in
/stock/out
/stock/transfers
/stock/damaged
/stock/returns
/stock/movements

/projects
/projects/:id

/engineers

/reports/inventory
/reports/movements
/reports/purchases
/reports/usage

/users
/roles
/permissions

/notifications

/system-logs

/settings
```

Add other pages where necessary.

---

# 62. SIDEBAR NAVIGATION

Organize navigation logically:

```text
Dashboard

Inventory
    Products
    Categories
    Brands
    Stock In
    Stock Out
    Transfers
    Damaged
    Returns
    Stock Movements

Locations
    Warehouses
    Stores
    Branches

Purchasing
    Suppliers
    Purchases

Projects
    Projects
    Engineer Assignments
    Project Stock

Reports
    Inventory
    Stock Movement
    Purchases
    Usage

Administration
    Users
    Roles
    Permissions
    System Logs
    Settings
```

Only show navigation items allowed by the user's permissions.

---

# 63. MODAL FORM REQUIREMENTS

All forms should:

* Validate input
* Show required fields
* Show errors clearly
* Prevent duplicate submission
* Show loading state
* Close only when appropriate
* Reset correctly
* Refresh relevant data after success
* Emit WebSocket updates where required

---

# 64. API AUTHORIZATION EXAMPLE

Do not implement authorization like:

```javascript
if (user.role === 'admin')
```

everywhere.

Create reusable middleware such as:

```javascript
authorize('stock.receive')
```

or:

```javascript
requirePermission('stock.receive')
```

This makes the system maintainable.

---

# 65. IMPORTANT STOCK BUSINESS RULES

Implement these rules strictly:

### Rule 1

Never allow unauthorized users to manipulate stock.

### Rule 2

Every stock modification must create a movement record.

### Rule 3

Never delete historical stock movement records through normal UI.

### Rule 4

Corrections must use adjustment/reversal movements.

### Rule 5

Never allow negative stock unless explicitly configured.

### Rule 6

Stock belongs to a location.

### Rule 7

Transfers affect two locations.

### Rule 8

Damaged items reduce usable stock but remain historically tracked.

### Rule 9

Purchased quantity must remain historically available.

### Rule 10

Current quantity and historical purchased quantity must never be confused.

### Rule 11

Serialized products require serial tracking.

### Rule 12

Concurrent stock operations must be transaction-safe.

---

# 66. EXAMPLE COMPLETE STOCK LIFECYCLE

Implement this workflow correctly:

```text
Supplier
   ↓
Purchase 100
   ↓
Warehouse A
   ↓
Current Stock = 100
   ↓
Issue 40 to Engineer
   ↓
Warehouse A = 60
Engineer = 40
   ↓
Engineer consumes 30
   ↓
Used = 30
   ↓
Engineer returns 8
   ↓
Warehouse A = 68
   ↓
2 become damaged
   ↓
Damaged = 2
   ↓
Purchase another 100
   ↓
Warehouse A = 168
```

Historical records should still show:

```text
Total Purchased = 200
Issued = 40
Consumed = 30
Returned = 8
Damaged = 2
Current Warehouse Stock = 168
```

The exact stock calculation should be determined by the transaction ledger and location balances.

---

# 67. DEVELOPMENT PROCESS

Do not attempt to blindly generate the entire project in one uncontrolled step.

Follow this implementation order:

## Phase 1 — Existing Database Inspection

Inspect the existing database.

Document existing tables and relationships.

Identify conflicts.

Do not destroy anything.

## Phase 2 — Backend Foundation

Implement:

* Express
* Sequelize
* Configuration
* Error handling
* Authentication
* Authorization
* Logging

## Phase 3 — Database

Implement safe migrations and models.

## Phase 4 — Inventory Engine

Implement:

* Stock balances
* Stock movements
* Stock in
* Stock out
* Transfers
* Damage
* Returns
* Adjustments
* Serial numbers

This is the most important module.

## Phase 5 — Product Management

Implement:

* Products
* Categories
* Brands
* Suppliers
* Attachments

## Phase 6 — Locations

Implement:

* Warehouses
* Stores
* Branches
* Transfers

## Phase 7 — Users/Roles/Permissions

Implement complete RBAC.

## Phase 8 — Dashboard

Implement statistics and charts.

## Phase 9 — Realtime

Implement WebSocket stock updates.

## Phase 10 — Notifications/Email

Implement notification and SMTP systems.

## Phase 11 — Projects/Engineers

Implement project stock utilization and assignments.

## Phase 12 — Reports

Implement inventory and movement reports.

## Phase 13 — UI/UX

Complete responsive design, dark mode, localization and theme customization.

## Phase 14 — Security Testing

Test authorization, validation, uploads, concurrency and destructive operations.

## Phase 15 — Final Testing

Test all major workflows end-to-end.

---

# 68. TESTING REQUIREMENTS

Create tests for critical business logic.

Especially test:

```text
Purchase
Stock issue
Stock transfer
Stock damage
Stock return
Stock adjustment
Serial numbers
Negative stock prevention
Concurrent stock operations
Role permissions
Unauthorized access
File uploads
Authentication
Password reset
```

Example:

```text
Initial stock = 100

User A tries to issue 80
User B tries to issue 50 simultaneously

Expected:
Only one/both operations succeed according to available quantity.
Final stock must NEVER be negative.
```

---

# 69. QUALITY REQUIREMENTS

Do not create placeholder functionality such as:

```javascript
// TODO implement later
```

for core features.

Do not create fake APIs.

Do not create fake dashboard statistics.

Do not hard-code stock quantities.

Do not hard-code users.

Do not hard-code permissions.

Do not use mock data in production screens after the actual API has been implemented.

All buttons shown in the UI should perform real functionality.

---

# 70. FINAL ACCEPTANCE CRITERIA

The system is considered complete only when:

* Backend runs successfully.
* Frontend runs successfully.
* Database connects successfully.
* Existing database data remains intact.
* Authentication works.
* Authorization works.
* All required roles work.
* Products can be created/updated/viewed.
* Stock can be received.
* Stock can be issued.
* Stock can be transferred.
* Stock can be damaged.
* Stock can be returned.
* Stock can be adjusted.
* Historical stock movements are preserved.
* Multiple warehouses/stores work.
* Serialized products work.
* Attachments work.
* Dashboard statistics work.
* Reports work.
* WebSocket stock updates work.
* Notifications work.
* SMTP works.
* Dark mode works.
* Theme customization works.
* Localization works.
* Pagination works.
* Search/filtering works.
* Audit logs work.
* Security controls work.
* Responsive UI works.
* Database transactions protect stock integrity.
* No destructive database operations are performed automatically.
* Documentation is complete.
* Application can be deployed to a production environment.

---

# 71. IMPORTANT INSTRUCTION TO THE AI CODING AGENT

You are acting as a **senior full-stack software architect and developer**.

Before writing code:

1. Inspect the existing project.
2. Inspect the existing database structure.
3. Inspect existing Sequelize models.
4. Inspect existing API routes.
5. Inspect existing frontend structure.
6. Identify reusable code.
7. Identify conflicts.
8. Create a development plan.
9. Then implement the system incrementally.

Do not unnecessarily rewrite working code.

Do not destroy existing functionality.

Do not drop the database.

Do not use destructive migrations.

Do not use `sequelize.sync({ force: true })`.

Do not expose credentials.

Do not bypass authentication.

Do not rely on frontend authorization.

Do not manipulate stock without transactions.

Do not allow historical stock records to be silently deleted.

When modifying existing files, preserve unrelated functionality.

After implementing each major module:

1. Run the application.
2. Check for errors.
3. Test the API.
4. Test database interactions.
5. Fix errors before continuing.
6. Update documentation where necessary.

At the end, provide a concise implementation report containing:

```text
Implemented modules
Created tables
Created migrations
Created API endpoints
Created frontend pages
Created roles/permissions
Created WebSocket events
Created reports
Security features
Tests performed
Known limitations
How to run the system
```

The final result must be a **real, functional, maintainable, production-oriented inventory and stock management platform**, not a UI prototype.

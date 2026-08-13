# Database Design Notes

This system is designed to work with an existing MySQL instance and coexist with other application schemas.

## Required Compatibility Rules

- Do not drop the existing database.
- Do not reset the database.
- Never use `sequelize.sync({ force: true })`.
- Use safe Sequelize migrations for schema evolution.

## Core Entities

The implementation includes Sequelize-ready model skeletons for:

- users
- roles
- products
- brands
- categories
- suppliers
- warehouses
- stock_movements
- system_logs
- settings

The stock movement ledger is the authoritative source for inventory lifecycle and historical balances.

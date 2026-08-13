# API Documentation

## Base URL

```text
/api/v1
```

## Health

```http
GET /api/v1/health
```

## Authentication

```http
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

## Products

```http
GET /api/v1/products
POST /api/v1/products
PUT /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Stock

```http
GET /api/v1/stock/movements
POST /api/v1/stock/in
POST /api/v1/stock/out
POST /api/v1/stock/transfer
POST /api/v1/stock/damage
POST /api/v1/stock/return
```

## Other modules

```http
GET /api/v1/categories
GET /api/v1/brands
GET /api/v1/suppliers
GET /api/v1/locations
GET /api/v1/reports
GET /api/v1/notifications
GET /api/v1/settings
GET /api/v1/system-logs
GET /api/v1/roles
GET /api/v1/permissions
GET /api/v1/users
```

## Response Format

```json
{
  "success": true,
  "message": "operation_message",
  "data": {}
}
```

# Stock Management System

A full-stack stock, inventory, asset, and stock-movement management platform for generic business operations including ATM installations, maintenance, support, and hardware-related businesses.

## Stack

- Backend: Node.js + Express.js + Sequelize + MySQL
- Frontend: Vite + React.js
- Realtime: Socket.IO
- File uploads: Multer
- Auth: JWT
- Security: Helmet, CORS, rate limiting

## Backend

The backend exposes API endpoints under `/api/v1` and contains skeleton Sequelize models for the required inventory domains.

## Frontend

The frontend is a responsive dashboard-first React interface with navigation, stock cards, product management UI, movement views, and reports.

## Development

```bash
# Backend
cd backend
npm start

# Frontend
npm --prefix frontend run dev
```

# Quick Start Guide - Stock Management System

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend
```bash
cd backend
npm start
```
✅ You should see:
```
Database connection established using Sequelize
Sequelize model synchronization completed safely
Stock Management System API running on port 3000
```

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
✅ You should see:
```
VITE v4.5.14 ready in X ms
➜ Local: http://localhost:5173/
```

### Step 3: Open Your Browser
Go to: **http://localhost:5173**

---

## 🔐 Login Credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@example.com | password |
| Stock Manager | stock@example.com | password |

---

## 📋 What You Can Do

### After Login

1. **View Dashboard** - Statistics and live updates
2. **Manage Products** - Add/edit products
3. **Stock Operations** - Receive, issue, transfer, damage tracking
4. **Suppliers** - Supplier management
5. **Locations** - Warehouse/store configuration
6. **Reports** - Analytics and reports
7. **Users & Admin** - User and role management
8. **Settings** - System configuration

### Navigation

All features accessible from the **left sidebar** with icons:
- 🏠 Dashboard
- 📦 Products & Catalog
- 📊 Stock Operations
- 🚚 Suppliers & Locations
- 📈 Reports & Logs
- ⚙️ Administration

---

## ✨ Features

✅ **Professional UI** with Lucide React icons
✅ **Complete Authentication** (login, register, forgot password)
✅ **Full Navigation** with 30+ menu items
✅ **Responsive Design** (works on mobile, tablet, desktop)
✅ **Protected Routes** (authentication required)
✅ **Real-time Feedback** (loading states, error handling)
✅ **Clean Design** (modern, professional appearance)

---

## 🔧 Troubleshooting

### "Cannot connect to API"
- Ensure backend is running: `npm start` in backend folder
- Check http://localhost:3000/api/v1/health
- Verify vite.config.js has `target: 'http://localhost:3000'`

### "Port already in use"
```bash
# Kill process on port 3000
lsof -i :3000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### "Login stuck on loading"
- Check browser console for errors (F12)
- Verify backend API is responding
- Clear browser cache and reload
- Try different browser

---

## 📱 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | /login | User authentication |
| Dashboard | / | Statistics and overview |
| Products | /products | Product catalog |
| Stock In | /stock/in | Receive inventory |
| Stock Out | /stock/out | Issue inventory |
| Transfers | /stock/transfers | Move between locations |
| Reports | /reports | Analytics |
| Settings | /settings | Configuration |
| Users | /users | User management |

---

## 🎯 Demo Workflow

1. **Login** with admin@example.com / password
2. **View Dashboard** - See statistics
3. **Navigate Sidebar** - Click different items
4. **Try Stock Operations** - Explore all pages
5. **Logout** - Click user card button

---

## 📞 Support

For detailed documentation, see:
- `SETUP_AND_TESTING.md` - Complete setup and API documentation
- `ISSUES_FIXED_AND_COMPLETED.md` - What's been fixed and completed
- `API_DOCUMENTATION.md` - Full API endpoint reference
- `development-guide.md` - Original specification

---

## ✅ System Status

| Component | Status | Port |
|-----------|--------|------|
| Backend API | ✅ Running | 3000 |
| Frontend | ✅ Running | 5173 |
| Database | ✅ Connected | 3306 |
| Authentication | ✅ Working | JWT |

---

**Everything is ready to go! Visit http://localhost:5173 now!**

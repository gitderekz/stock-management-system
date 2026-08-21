import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { apiGet } from './api.js';
import { SearchProvider } from './context/SearchContext.jsx';

// Icons from lucide-react
import {
  Home, Package, ArrowLeftRight, Truck, MapPin, BarChart3, Settings,
  Layers, Tag, LogOut, ShoppingCart, AlertCircle,
  RotateCcw, FileText, Users, Bell, Search, Clock,
  Menu, SunMoon, Globe, User, ChevronDown
} from 'lucide-react';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import BrandsPage from './pages/BrandsPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import LocationsPage from './pages/LocationsPage.jsx';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage.jsx';
import StockInPage from './pages/StockInPage.jsx';
import StockOutPage from './pages/StockOutPage.jsx';
import { StockTransferPage, DamagedPage, ReturnsPage, StockMovementsPage } from './pages/StockPages.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import UsersPage from './pages/UsersRolesPage.jsx';
import RolesPage from './pages/RolesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SystemLogsPage from './pages/SystemLogsPage.jsx';
import BatchTrackingPage from './pages/BatchTrackingPage.jsx';

// Dashboard Component with Stats
const StatCard = ({ title, value, delta, trend }) => (
  <article className="stat-card">
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <span className="badge badge-soft">{trend}</span>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-meta">
      <span className={`trend ${delta.startsWith('+') ? 'positive' : 'negative'}`}>{delta}</span>
      <span className="muted">vs last month</span>
    </div>
  </article>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProductPage(1);
  }, [products.length]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/dashboard');
        // backend returns dashboard payload directly (stats, stockSegments, recentMovements)
        if (response) setDashboardData(response);
        
        // Fetch products for table widget
        const prodResponse = await apiGet('/products');
        // products endpoint wraps response in {success, data} format
        if (prodResponse && prodResponse.data && Array.isArray(prodResponse.data)) {
          setProducts(prodResponse.data.slice(0, 5)); // Show top 5 products
        } else if (Array.isArray(prodResponse)) {
          setProducts(prodResponse.slice(0, 5));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="content-space"><p>Loading dashboard...</p></div>;
  if (error) return <div className="content-space"><p className="error">Error: {error}</p></div>;
  if (!dashboardData) return <div className="content-space"><p>No data available</p></div>;

  const stats = dashboardData.stats || {};
  const segments = dashboardData.stockSegments || [];
  const movements = dashboardData.recentMovements || [];

  const formatCurrency = (value) => {
    return `TZS ${(value / 1000000).toFixed(2)}M`;
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'purchase':
      case 'in':
        return 'success';
      case 'sale':
      case 'out':
        return 'danger';
      case 'damage':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getMovementTitle = (type) => {
    const titles = {
      purchase: 'Stock-In received',
      in: 'Stock received',
      sale: 'Stock-Out issued',
      out: 'Stock issued',
      transfer: 'Transfer completed',
      damage: 'Damaged item',
      return: 'Return processed',
    };
    return titles[type] || 'Stock Movement';
  };

  const maxSegment = Math.max(...segments.map(s => s.value), 1);
  const getSegmentHeight = (value) => ((value / maxSegment) * 100 || 5);

  const productsPerPage = 5;
  const totalProductPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const safeProductPage = Math.min(productPage, totalProductPages);
  const visibleProducts = products.slice((safeProductPage - 1) * productsPerPage, safeProductPage * productsPerPage);

  return (
    <div className="content-space">
      <section className="stats-grid">
        <StatCard title="Total Products" value={stats.totalProducts || 0} delta="+0%" trend="Inventory" />
        <StatCard title="Stock Value" value={formatCurrency(stats.totalStockValue || 0)} delta="+0%" trend="Value" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockAlerts || 0} delta={stats.lowStockAlerts ? '-' + stats.lowStockAlerts : '0'} trend="Risk" />
        <StatCard title="Today's Movements" value={(stats.purchasesToday || 0) + (stats.salesToday || 0)} delta={`+${stats.purchasesToday || 0} in, -${stats.salesToday || 0} out`} trend="Activity" />
      </section>

      <section className="grid two-col">
        <article className="panel large-panel">
          <div className="panel-header">
            <div>
              <div className="panel-label">Inventory Health</div>
              <h3 className="panel-title">Stock Distribution</h3>
            </div>
          </div>
          <div className="chart-area">
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
              <div style={{ width: 42, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: '#64748b', paddingBottom: 18 }}>
                {[4, 3, 2, 1, 0].map((tick) => (
                  <div key={tick} style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{tick}</div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ position: 'relative', height: 220, borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-end', gap: 14, padding: '8px 8px 0 8px' }}>
                  {segments.map((segment, idx) => {
                    const colors = ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'];
                    const max = Math.max(...segments.map((s) => Number(s.value || 0)), 1);
                    const value = Number(segment.value || 0);
                    const height = max > 0 ? `${Math.max((value / max) * 100, value > 0 ? 12 : 0)}%` : '0%';
                    return (
                      <div key={idx} style={{ flex: 1, minWidth: 80, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} title={`${segment.name}: ${segment.value} items`}>
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <div style={{ width: '80%', height, minHeight: value > 0 ? 18 : 0, background: colors[idx % colors.length], borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, boxShadow: '0 8px 18px rgba(15, 23, 42, 0.12)' }}>{value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10, fontSize: 12, color: '#334155', fontWeight: 600 }}>
                  {segments.map((segment, idx) => (
                    <div key={idx} style={{ flex: 1, textAlign: 'center' }}>{segment.name}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-label">Live Updates</div>
              <h3 className="panel-title">Recent Movements</h3>
            </div>
            <span className="online-dot">Live</span>
          </div>
          <div className="feed-list">
            {movements.length > 0 ? (
              movements.map((movement, idx) => (
                <div key={idx} className="feed-item">
                  <span className={`feed-icon ${getMovementIcon(movement.type)}`}>
                    {getMovementIcon(movement.type) === 'success' ? '+' : getMovementIcon(movement.type) === 'danger' ? '−' : '!'}
                  </span>
                  <div>
                    <div className="feed-title">{getMovementTitle(movement.type)}</div>
                    <div className="feed-body">{movement.quantity} units • By {movement.user}</div>
                    <div className="feed-time">{new Date(movement.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="feed-item">
                <span className="feed-icon info">○</span>
                <div>
                  <div className="feed-title">No recent movements</div>
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="panel full-width" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-label">Inventory Overview</div>
            <h3 className="panel-title">Products Liste</h3>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Product Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Brand</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.length > 0 ? visibleProducts.map((product, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {product.images && product.images.length > 0 && (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{product.brand || '—'}</td>
                  <td style={{ padding: '12px' }}>{product.category || '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{product.quantity || 0}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>TZS {(product.price || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: product.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: product.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {product.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {products.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '14px' }}>
            <button type="button" className="btn btn-light" onClick={() => setProductPage((p) => Math.max(1, p - 1))} disabled={safeProductPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {safeProductPage}/{totalProductPages}</span>
            <button type="button" className="btn btn-light" onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))} disabled={safeProductPage >= totalProductPages}>Next</button>
          </div>
        )}
      </section>
    </div>
  );
};

// Sidebar Component with Lucide Icons
const Sidebar = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationGroups = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', path: '/', icon: Home },
      ]
    },
    {
      label: 'Inventory',
      items: [
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Categories', path: '/categories', icon: Layers },
        { label: 'Brands', path: '/brands', icon: Tag },
      ]
    },
    {
      label: 'Stock Operations',
      items: [
        { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
        { label: 'Stock In', path: '/stock/in', icon: ShoppingCart },
        { label: 'Stock Out', path: '/stock/out', icon: LogOut },
        { label: 'Transfers', path: '/stock/transfers', icon: ArrowLeftRight },
        { label: 'Damaged', path: '/stock/damaged', icon: AlertCircle },
        { label: 'Returns', path: '/stock/returns', icon: RotateCcw },
        { label: 'Movements', path: '/stock/movements', icon: Clock },
      ]
    },
    {
      label: 'Business',
      items: [
        { label: 'Suppliers', path: '/suppliers', icon: Truck },
        { label: 'Locations', path: '/locations', icon: MapPin },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Batch Tracking', path: '/batches', icon: Layers },
        { label: 'Logs', path: '/system-logs', icon: FileText },
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users & Roles', path: '/users', icon: Users },
        { label: 'Roles Management', path: '/roles', icon: Users },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <img src="/uploads/logo.png" alt="Logo" className="sidebar-logo" onError={(e)=>{e.target.style.display='none'}} />
          </div>
          {sidebarOpen && (
            <div>
              <div className="brand-title">StockFlow</div>
              <div className="brand-subtitle">Inventory OS</div>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>
          <Menu size={18} />
        </button>
      </div>

      <div className="nav-scroll">
        <div className="nav-list">
          {navigationGroups.map((group) => (
            <div key={group.label} className="nav-group">
              {sidebarOpen && <div className="nav-group-label">{group.label}</div>}
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end={item.path === '/'}
                    title={item.label}
                  >
                    <IconComponent size={20} className="nav-icon-svg" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="user-card">
        <div className="avatar">
          {user?.fullName?.split(' ').map((n) => n[0]).join('') || 'U'}
        </div>
        {sidebarOpen && (
          <div className="user-meta">
            <div className="user-name">{user?.fullName || 'User'}</div>
            <div className="user-role">{user?.role || 'user'}</div>
          </div>
        )}
        <button 
          className="logout-btn"
          onClick={onLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

// Topbar Component
const Topbar = ({ pageTitle, pageSubtitle, user, theme, language, onThemeToggle, onLanguageChange, searchQuery, onSearchChange, notificationCount }) => {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-kicker">Stock Management</div>
          <h1 className="page-title">{pageTitle || 'Dashboard'}</h1>
          {pageSubtitle && <div className="page-subtitle">{pageSubtitle}</div>}
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search inventory, suppliers, reports..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <button type="button" className="icon-button" onClick={() => navigate('/notifications')} title="Notifications">
          <Bell size={18} />
          {notificationCount > 0 && <span className="notification-pill">{notificationCount}</span>}
        </button>
        <button type="button" className="icon-button" onClick={onThemeToggle} title="Toggle theme">
          <SunMoon size={18} />
        </button>

        <div className="language-picker">
          <Globe size={18} />
          <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
            <option value="English">English</option>
            <option value="Swahili">Swahili</option>
            <option value="French">French</option>
          </select>
        </div>

        <button type="button" className="icon-button" onClick={() => navigate('/settings')} title="Settings">
          <Settings size={18} />
        </button>

        <button type="button" className="profile-button" onClick={() => navigate('/users')}>
          <User size={18} />
          <span>{user?.fullName?.split(' ')[0] || 'Me'}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
};

// Layout wrapper for protected pages
const MainLayout = ({ children, pageTitle, pageSubtitle, theme, language, onThemeToggle, onLanguageChange, searchQuery, onSearchChange, notificationCount }) => {
  const { user, logout } = useAuth();

  return (
    <div className={`app-shell ${theme}`}>
      <Sidebar user={user} onLogout={logout} />
      <main className="main-content">
        <Topbar
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          user={user}
          theme={theme}
          language={language}
          onThemeToggle={onThemeToggle}
          onLanguageChange={onLanguageChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          notificationCount={notificationCount}
        />
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, token, loading } = useAuth();
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const response = await apiGet('/notifications', token);
      const notifications = response.data || [];
      const unreadCount = notifications.filter((item) => item.seen !== true).length;
      setNotificationCount(unreadCount);
    } catch (err) {
      console.warn('Unable to load notifications', err.message);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadNotifications();
    }
  }, [user, token]);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <SearchProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/" replace />} />

        <Route path="/" element={<MainLayout pageTitle="Dashboard" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><DashboardPage /></MainLayout>} />
        <Route path="/products" element={<MainLayout pageTitle="Products" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><ProductsPage /></MainLayout>} />
        <Route path="/categories" element={<MainLayout pageTitle="Categories" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><CategoriesPage /></MainLayout>} />
        <Route path="/brands" element={<MainLayout pageTitle="Brands" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><BrandsPage /></MainLayout>} />
        <Route path="/suppliers" element={<MainLayout pageTitle="Suppliers" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><SuppliersPage /></MainLayout>} />
        <Route path="/locations" element={<MainLayout pageTitle="Locations/Warehouses" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><LocationsPage /></MainLayout>} />
        <Route path="/purchase-orders" element={<MainLayout pageTitle="Purchase Orders" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><PurchaseOrdersPage /></MainLayout>} />
        <Route path="/stock/in" element={<MainLayout pageTitle="Stock In" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><StockInPage /></MainLayout>} />
        <Route path="/stock/out" element={<MainLayout pageTitle="Stock Out" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><StockOutPage /></MainLayout>} />
        <Route path="/stock/transfers" element={<MainLayout pageTitle="Stock Transfers" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><StockTransferPage /></MainLayout>} />
        <Route path="/stock/damaged" element={<MainLayout pageTitle="Damaged Stock" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><DamagedPage /></MainLayout>} />
        <Route path="/stock/returns" element={<MainLayout pageTitle="Stock Returns" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><ReturnsPage /></MainLayout>} />
        <Route path="/stock/movements" element={<MainLayout pageTitle="Stock Movements" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><StockMovementsPage /></MainLayout>} />
        <Route path="/reports" element={<MainLayout pageTitle="Reports" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><ReportsPage /></MainLayout>} />
        <Route path="/batches" element={<MainLayout pageTitle="Batch Tracking" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><BatchTrackingPage /></MainLayout>} />
        <Route path="/users" element={<MainLayout pageTitle="Users & Roles" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><UsersPage /></MainLayout>} />
        <Route path="/roles" element={<MainLayout pageTitle="Roles Management" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><RolesPage /></MainLayout>} />
        <Route path="/notifications" element={<MainLayout pageTitle="Notifications" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><NotificationsPage /></MainLayout>} />
        <Route path="/settings" element={<MainLayout pageTitle="Settings" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><SettingsPage /></MainLayout>} />
        <Route path="/system-logs" element={<MainLayout pageTitle="System Logs" theme={theme} language={language} onThemeToggle={handleThemeToggle} onLanguageChange={handleLanguageChange} searchQuery={searchQuery} onSearchChange={setSearchQuery} notificationCount={notificationCount}><SystemLogsPage /></MainLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SearchProvider>
  );
};

export default App;

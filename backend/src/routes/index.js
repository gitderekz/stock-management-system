const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { listProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const { listLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/locationsController');
const { listSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/suppliersController');
const { createStockIn, createStockOut, createTransfer, createDamage, createReturn, listMovements } = require('../controllers/stockController');
const { listCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoriesController');
const { listBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandsController');
const { getReports } = require('../controllers/reportsController');
const { listNotifications, createNotification, updateNotification, deleteNotification, markAsSeen } = require('../controllers/notificationsController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { listLogs } = require('../controllers/logsController');
const { listRoles, listPermissions } = require('../controllers/rolesController');
const { listRoles: listRolesForManagement, createRole, updateRole, deleteRole } = require('../controllers/roleManagementController');
const { protect, requirePermission } = require('../middleware/auth');
const { upload, uploadProductImage, uploadProductVideo } = require('../controllers/productMediaController');
const { login, register, forgotPassword, resetPassword, currentUser, listUsers, updateUser, deleteUser } = require('../controllers/usersController');

const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/products', listProducts);
router.post('/products', protect, requirePermission('products.create'), createProduct);
router.put('/products/:id', protect, requirePermission('products.update'), updateProduct);
router.delete('/products/:id', protect, requirePermission('products.delete'), deleteProduct);
router.post('/products/:id/images', protect, requirePermission('products.update'), upload.single('file'), uploadProductImage);
router.post('/products/:id/videos', protect, requirePermission('products.update'), upload.single('file'), uploadProductVideo);

router.get('/categories', listCategories);
router.post('/categories', protect, requirePermission('categories.manage'), createCategory);
router.put('/categories/:id', protect, requirePermission('categories.manage'), updateCategory);
router.delete('/categories/:id', protect, requirePermission('categories.manage'), deleteCategory);

router.get('/brands', listBrands);
router.post('/brands', protect, requirePermission('brands.manage'), createBrand);
router.put('/brands/:id', protect, requirePermission('brands.manage'), updateBrand);
router.delete('/brands/:id', protect, requirePermission('brands.manage'), deleteBrand);

router.get('/locations', listLocations);
router.post('/locations', protect, requirePermission('locations.manage'), createLocation);
router.put('/locations/:id', protect, requirePermission('locations.manage'), updateLocation);
router.delete('/locations/:id', protect, requirePermission('locations.manage'), deleteLocation);

router.get('/suppliers', listSuppliers);
router.post('/suppliers', protect, requirePermission('suppliers.manage'), createSupplier);
router.put('/suppliers/:id', protect, requirePermission('suppliers.manage'), updateSupplier);
router.delete('/suppliers/:id', protect, requirePermission('suppliers.manage'), deleteSupplier);

router.get('/stock/movements', listMovements);
router.post('/stock/in', protect, requirePermission('stock.receive'), createStockIn);
router.post('/stock/out', protect, requirePermission('stock.issue'), createStockOut);
router.post('/stock/transfer', protect, requirePermission('stock.transfer'), createTransfer);
router.post('/stock/damage', protect, requirePermission('stock.damage'), createDamage);
router.post('/stock/return', protect, requirePermission('stock.return'), createReturn);

router.get('/reports', protect, requirePermission('reports.view'), getReports);
router.get('/notifications', protect, listNotifications);
router.post('/notifications', protect, requirePermission('users.manage'), createNotification);
router.put('/notifications/:id', protect, requirePermission('users.manage'), updateNotification);
router.delete('/notifications/:id', protect, requirePermission('users.manage'), deleteNotification);
router.put('/notifications/:id/mark-seen', protect, markAsSeen);

router.get('/settings', protect, requirePermission('settings.manage'), getSettings);
router.put('/settings', protect, requirePermission('settings.manage'), updateSettings);
router.get('/system-logs', protect, requirePermission('logs.view'), listLogs);

router.get('/roles', protect, requirePermission('users.manage'), listRolesForManagement);
router.post('/roles', protect, requirePermission('users.manage'), createRole);
router.put('/roles/:id', protect, requirePermission('users.manage'), updateRole);
router.delete('/roles/:id', protect, requirePermission('users.manage'), deleteRole);

router.get('/permissions', protect, requirePermission('users.manage'), listPermissions);
router.get('/users', protect, requirePermission('users.manage'), listUsers);
router.put('/users/:id', protect, requirePermission('users.manage'), updateUser);
router.delete('/users/:id', protect, requirePermission('users.manage'), deleteUser);

router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', protect, currentUser);
router.post('/auth/logout', protect, (req, res) => res.json({ success: true, message: 'Logout successful' }));

module.exports = router;

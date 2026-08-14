import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { exportToCSV, exportToExcel, exportToPDF, importFromCSV, importFromExcel } from '../utils/export.js';

const initialForm = {
  name: '',
  categoryId: '',
  brandId: '',
  supplierId: '',
  quantity: 0,
  price: 0,
  condition: 'new',
  serialCode: '',
};

const ProductsPage = () => {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const modal = useModal();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // Advanced filters
  const [filters, setFilters] = useState({
    categoryId: '',
    brandId: '',
    supplierId: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
    showLowStock: false,
  });

  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const loadProducts = async () => {
    try {
      const response = await apiGet('/products', token);
      setProducts(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiGet('/categories', token);
      setCategories(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await apiGet('/brands', token);
      setBrands(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await apiGet('/suppliers', token);
      setSuppliers(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    loadSuppliers();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase().trim();
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query) ||
        (product.serialCode || '').toLowerCase().includes(query);
      
      const matchesCategory = !filters.categoryId || product.categoryId === Number(filters.categoryId);
      const matchesBrand = !filters.brandId || product.brandId === Number(filters.brandId);
      const matchesSupplier = !filters.supplierId || product.supplierId === Number(filters.supplierId);
      const matchesCondition = !filters.condition || product.condition === filters.condition;
      
      const matchesPrice = (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || product.price <= Number(filters.maxPrice));
      
      const matchesQuantity = (!filters.minQuantity || product.quantity >= Number(filters.minQuantity)) &&
        (!filters.maxQuantity || product.quantity <= Number(filters.maxQuantity));
      
      const matchesLowStock = !filters.showLowStock || product.quantity < 10;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesSupplier && 
             matchesCondition && matchesPrice && matchesQuantity && matchesLowStock;
    });
  }, [products, search, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['quantity', 'price', 'categoryId', 'brandId', 'supplierId'].includes(name) ? Number(value) : value,
    }));
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        supplierId: product.supplierId || '',
        quantity: product.quantity,
        price: product.price,
        condition: product.condition,
        serialCode: product.serialCode || '',
      });
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setError('');
    setMessage('');
    modal.open();
  };

  const handleEdit = (product) => openProductModal(product);

  const handleDelete = async (productId) => {
    try {
      await apiDelete(`/products/${productId}`, token);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setMessage('Product deleted successfully.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        supplierId: form.supplierId || undefined,
        quantity: form.quantity,
        price: form.price,
        condition: form.condition,
        serialCode: form.serialCode,
      };

      const response = editing
        ? await apiPut(`/products/${editing.id}`, payload, token)
        : await apiPost('/products', payload, token);

      const created = response.data;
      if (editing) {
        setProducts((prev) => prev.map((item) => (item.id === editing.id ? created : item)));
        setMessage('Product updated successfully.');
      } else {
        setProducts((prev) => [created, ...prev]);
        setMessage('Product added successfully.');
      }
      // upload media if present
      try {
        if (imageFiles && imageFiles.length > 0) {
          for (const f of imageFiles) {
            const fd = new FormData();
            fd.append('file', f, f.name);
            await apiUpload(`/products/${created.id}/images`, fd, token);
          }
        }
        if (videoFiles && videoFiles.length > 0) {
          for (const f of videoFiles) {
            const fd2 = new FormData();
            fd2.append('file', f, f.name);
            await apiUpload(`/products/${created.id}/videos`, fd2, token);
          }
        }
      } catch (uploadErr) {
        console.error('Media upload failed', uploadErr);
      }
      setEditing(null);
      setForm(initialForm);
      setError('');
      modal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles(files);
  };

  const handleExport = (type) => {
    if (type === 'csv') {
      exportToCSV(filteredProducts);
    } else if (type === 'xls') {
      exportToExcel(filteredProducts);
    } else if (type === 'pdf') {
      exportToPDF(filteredProducts);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = file.name.toLowerCase().endsWith('.csv')
        ? await importFromCSV(file)
        : await importFromExcel(file);

      const createdProducts = await Promise.all(
        data.map(async (row) => {
          const response = await apiPost('/products', row, token);
          return response.data;
        })
      );

      setProducts((prev) => [...createdProducts, ...prev]);
      setMessage('Import completed successfully.');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Inventory</div>
            <h3 className="panel-title">Products</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <input
                type="search"
                className="text-input"
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className="btn btn-light" type="button" onClick={() => fileInputRef.current?.click()}>
                Import
              </button>
              <button className="btn btn-light" type="button" onClick={() => handleExport('csv')}>
                CSV
              </button>
              <button className="btn btn-light" type="button" onClick={() => handleExport('xls')}>
                Excel
              </button>
              <button className="btn btn-light" type="button" onClick={() => handleExport('pdf')}>
                PDF
              </button>
              <input type="file" accept=".csv,.xlsx" hidden ref={fileInputRef} onChange={handleImport} />
            </div>
            <div className="toolbar-group">
              <button className={`btn btn-ghost ${viewMode === 'grid' ? 'active' : ''}`} type="button" onClick={() => setViewMode('grid')}>
                Grid
              </button>
              <button className={`btn btn-ghost ${viewMode === 'list' ? 'active' : ''}`} type="button" onClick={() => setViewMode('list')}>
                List
              </button>
              <button className="btn btn-primary" type="button" onClick={() => openProductModal()}>
                + Add Product
              </button>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="panel filter-panel">
        <div className="filter-section">
          <h4 className="filter-title">Advanced Filters</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select 
                className="text-input filter-select" 
                value={filters.categoryId} 
                onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Brand</label>
              <select 
                className="text-input filter-select" 
                value={filters.brandId} 
                onChange={(e) => setFilters({...filters, brandId: e.target.value})}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Supplier</label>
              <select 
                className="text-input filter-select" 
                value={filters.supplierId} 
                onChange={(e) => setFilters({...filters, supplierId: e.target.value})}
              >
                <option value="">All Suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Condition</label>
              <select 
                className="text-input filter-select" 
                value={filters.condition} 
                onChange={(e) => setFilters({...filters, condition: e.target.value})}
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Price Range (Min)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Min price" 
                value={filters.minPrice} 
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Price Range (Max)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Max price" 
                value={filters.maxPrice} 
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Quantity (Min)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Min quantity" 
                value={filters.minQuantity} 
                onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Quantity (Max)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Max quantity" 
                value={filters.maxQuantity} 
                onChange={(e) => setFilters({...filters, maxQuantity: e.target.value})}
              />
            </div>
            <div className="filter-group checkbox-group">
              <label className="filter-label">
                <input 
                  type="checkbox" 
                  checked={filters.showLowStock} 
                  onChange={(e) => setFilters({...filters, showLowStock: e.target.checked})}
                />
                Show Low Stock Only ({"<"} 10 units)
              </label>
            </div>
            <div className="filter-group button-group">
              <button 
                className="btn btn-ghost" 
                onClick={() => setFilters({
                  categoryId: '', brandId: '', supplierId: '', condition: '', 
                  minPrice: '', maxPrice: '', minQuantity: '', maxQuantity: '', showLowStock: false
                })}
              >
                Clear Filters
              </button>
              <span className="filter-result">
                {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>
        </div>
      </section>
        <section className="panel table-panel">
          {viewMode === 'list' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Condition</th>
                  <th>Serial</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category || 'N/A'}</td>
                    <td>{product.brand || 'N/A'}</td>
                    <td>{product.quantity}</td>
                    <td>TZS {Number(product.price).toLocaleString()}</td>
                    <td>{product.condition}</td>
                    <td>{product.serialCode || 'N/A'}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                  </div>
                  <div className="product-content">
                    <div className="product-title">{product.name}</div>
                    <div className="product-meta">{product.brand || 'Unknown'} • {product.category || 'Unassigned'} • Qty: {product.quantity}</div>
                    <div className="product-details">
                      <span>Price: TZS {Number(product.price).toLocaleString()}</span>
                      <span>Condition: {product.condition}</span>
                      <span>Serial: {product.serialCode || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="action-row">
                    <button className="btn btn-ghost" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      <Modal
        isOpen={modal.isOpen}
        title={editing ? 'Edit Product' : 'Add Product'}
        onClose={() => {
          modal.close();
          setEditing(null);
          setForm(initialForm);
          setError('');
        }}
        size="large"
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Name</label>
            <input className="text-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Category</label>
            <select className="text-input" name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Brand</label>
            <select className="text-input" name="brandId" value={form.brandId} onChange={handleChange} required>
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Supplier</label>
            <select className="text-input" name="supplierId" value={form.supplierId} onChange={handleChange}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Quantity</label>
            <input className="text-input" type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Price</label>
            <input className="text-input" type="number" name="price" min="0" value={form.price} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Condition</label>
            <select className="text-input" name="condition" value={form.condition} onChange={handleChange}>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Serial Code</label>
            <input className="text-input" name="serialCode" value={form.serialCode} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label className="field-label">Images</label>
            <input className="text-input" type="file" accept="image/*" multiple onChange={handleImageChange} />
          </div>
          <div className="field-group">
            <label className="field-label">Videos</label>
            <input className="text-input" type="file" accept="video/*" multiple onChange={handleVideoChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Create Product'}</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                modal.close();
                setEditing(null);
                setForm(initialForm);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;

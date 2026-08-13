import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPost } from '../api.js';

const useStockOptions = (token) => {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [productsResponse, locationsResponse, suppliersResponse] = await Promise.all([
          apiGet('/products', token),
          apiGet('/locations', token),
          apiGet('/suppliers', token),
        ]);
        setProducts(productsResponse.data || []);
        setLocations(locationsResponse.data || []);
        setSuppliers(suppliersResponse.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load stock options');
      }
    };
    load();
  }, [token]);

  return { products, locations, suppliers, error };
};

const StockInPage = () => {
  const { token } = useAuth();
  const { products, locations, suppliers, error } = useStockOptions(token);
  const [form, setForm] = useState({ productId: '', locationId: '', supplierId: '', quantity: 0, reference: '', notes: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitStockIn = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/in', {
        productId: form.productId,
        locationId: form.locationId,
        supplierId: form.supplierId,
        quantity: form.quantity,
        referenceNo: form.reference,
        reason: form.notes,
      }, token);
      setMessage('Stock received successfully.');
      setSubmitError('');
      setForm({ productId: '', locationId: '', supplierId: '', quantity: 0, reference: '', notes: '' });
    } catch (err) {
      setSubmitError(err.message);
      setMessage('');
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Stock In</h3>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="form-grid" onSubmit={submitStockIn}>
          <div className="field-group">
            <label className="field-label">Product</label>
            <select className="text-input" name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Location</label>
            <select className="text-input" name="locationId" value={form.locationId} onChange={handleChange} required>
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Supplier</label>
            <select className="text-input" name="supplierId" value={form.supplierId} onChange={handleChange}>
              <option value="">Select a supplier</option>
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
            <label className="field-label">Reference</label>
            <input className="text-input" name="reference" value={form.reference} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label className="field-label">Notes</label>
            <input className="text-input" name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Receive Stock</button>
          </div>
        </form>
      </article>
    </section>
  );
};

const StockOutPage = () => {
  const { token } = useAuth();
  const { products, locations, error } = useStockOptions(token);
  const [form, setForm] = useState({ productId: '', locationId: '', quantity: 0, destination: '', notes: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitStockOut = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/out', {
        productId: form.productId,
        locationId: form.locationId,
        quantity: form.quantity,
        destination: form.destination,
        reason: form.notes,
      }, token);
      setMessage('Stock issued successfully.');
      setSubmitError('');
      setForm({ productId: '', locationId: '', quantity: 0, destination: '', notes: '' });
    } catch (err) {
      setSubmitError(err.message);
      setMessage('');
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Stock Out</h3>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="form-grid" onSubmit={submitStockOut}>
          <div className="field-group">
            <label className="field-label">Product</label>
            <select className="text-input" name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Location</label>
            <select className="text-input" name="locationId" value={form.locationId} onChange={handleChange} required>
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Quantity</label>
            <input className="text-input" type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Destination</label>
            <input className="text-input" name="destination" value={form.destination} onChange={handleChange} />
          </div>
          <div className="field-group">
            <label className="field-label">Notes</label>
            <input className="text-input" name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Issue Stock</button>
          </div>
        </form>
      </article>
    </section>
  );
};

const StockTransferPage = () => {
  const { token } = useAuth();
  const { products, locations, error } = useStockOptions(token);
  const [form, setForm] = useState({ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 0, reference: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/transfer', {
        productId: form.productId,
        sourceLocationId: form.sourceLocationId,
        destinationLocationId: form.destinationLocationId,
        quantity: form.quantity,
        referenceNo: form.reference,
      }, token);
      setMessage('Transfer created successfully.');
      setSubmitError('');
      setForm({ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 0, reference: '' });
    } catch (err) {
      setSubmitError(err.message);
      setMessage('');
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Transfers</h3>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="form-grid" onSubmit={submitTransfer}>
          <div className="field-group">
            <label className="field-label">Product</label>
            <select className="text-input" name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Source Location</label>
            <select className="text-input" name="sourceLocationId" value={form.sourceLocationId} onChange={handleChange} required>
              <option value="">Select source</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Destination Location</label>
            <select className="text-input" name="destinationLocationId" value={form.destinationLocationId} onChange={handleChange} required>
              <option value="">Select destination</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Quantity</label>
            <input className="text-input" type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Reference</label>
            <input className="text-input" name="reference" value={form.reference} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create Transfer</button>
          </div>
        </form>
      </article>
    </section>
  );
};

const DamagedPage = () => {
  const { token } = useAuth();
  const { products, locations, error } = useStockOptions(token);
  const [form, setForm] = useState({ productId: '', locationId: '', quantity: 0, reason: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitDamage = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/damage', {
        productId: form.productId,
        locationId: form.locationId,
        quantity: form.quantity,
        reason: form.reason,
      }, token);
      setMessage('Damaged stock recorded.');
      setSubmitError('');
      setForm({ productId: '', locationId: '', quantity: 0, reason: '' });
    } catch (err) {
      setSubmitError(err.message);
      setMessage('');
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Damaged Stock</h3>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="form-grid" onSubmit={submitDamage}>
          <div className="field-group">
            <label className="field-label">Product</label>
            <select className="text-input" name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Location</label>
            <select className="text-input" name="locationId" value={form.locationId} onChange={handleChange} required>
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Quantity</label>
            <input className="text-input" type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Reason</label>
            <input className="text-input" name="reason" value={form.reason} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-danger">Record Damage</button>
          </div>
        </form>
      </article>
    </section>
  );
};

const ReturnsPage = () => {
  const { token } = useAuth();
  const { products, error } = useStockOptions(token);
  const [form, setForm] = useState({ productId: '', quantity: 0, reason: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitReturn = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/return', {
        productId: form.productId,
        quantity: form.quantity,
        reason: form.reason,
      }, token);
      setMessage('Return recorded successfully.');
      setSubmitError('');
      setForm({ productId: '', quantity: 0, reason: '' });
    } catch (err) {
      setSubmitError(err.message);
      setMessage('');
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Returns</h3>
          </div>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {submitError && <div className="alert alert-danger">{submitError}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="form-grid" onSubmit={submitReturn}>
          <div className="field-group">
            <label className="field-label">Product</label>
            <select className="text-input" name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Quantity</label>
            <input className="text-input" type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field-group">
            <label className="field-label">Reason</label>
            <input className="text-input" name="reason" value={form.reason} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Record Return</button>
          </div>
        </form>
      </article>
    </section>
  );
};

const StockMovementsPage = () => {
  const { token } = useAuth();
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');

  const loadMovements = async () => {
    try {
      const response = await apiGet('/stock/movements', token);
      setMovements(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [token]);

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Ledger</div>
            <h3 className="panel-title">Stock Movements</h3>
          </div>
          <button className="btn btn-ghost" onClick={loadMovements}>Refresh</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((moment) => (
              <tr key={moment.id}>
                <td>{moment.type}</td>
                <td>{moment.product || 'Unknown'}</td>
                <td>{moment.location || 'Unknown'}</td>
                <td>{moment.quantity}</td>
                <td>{new Date(moment.createdAt).toLocaleString()}</td>
                <td>{moment.user || 'System'}</td>
              </tr>
            ))}
            {!movements.length && (
              <tr><td colSpan="6" className="empty-row">No stock movement records found.</td></tr>
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
};

export { StockInPage, StockOutPage, StockTransferPage, DamagedPage, ReturnsPage, StockMovementsPage };

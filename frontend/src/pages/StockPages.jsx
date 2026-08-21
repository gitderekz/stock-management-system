import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPost } from '../api.js';

// simple pagination hook available to stock pages
const usePaginatedRows = (rows, pageSize = 10) => {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [rows?.length]);
  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = rows?.slice(startIndex, startIndex + pageSize) || [];
  return { page: safePage, setPage, totalPages, visibleRows };
};

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
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ productId: '', locationId: '', quantity: 0, destination: '', notes: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadRecords = async () => {
    try {
      const response = await apiGet('/stock/out', token);
      setRecords(response.data || []);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  useEffect(() => { loadRecords(); }, [token]);

  // pagination for transfers listing
  const paginatedTransfersLocal = usePaginatedRows(records, 10);
  const { page: trPageLocal, setPage: setTrPageLocal, totalPages: trTotalLocal, visibleRows: visibleTransfersLocal } = paginatedTransfersLocal;
  const paginatedReturns = usePaginatedRows(records, 10);
  const { page: retPage, setPage: setRetPage, totalPages: retTotal, visibleRows: visibleReturns } = paginatedReturns;

  const paginatedDamaged = usePaginatedRows(records, 10);
  const { page: dmgPage, setPage: setDmgPage, totalPages: dmgTotal, visibleRows: visibleDamaged } = paginatedDamaged;

  const paginatedTransfers = usePaginatedRows(records, 10);
  const { page: trPage, setPage: setTrPage, totalPages: trTotal, visibleRows: visibleTransfers } = paginatedTransfers;

  const paginatedOut = usePaginatedRows(records, 10);
  const { page: outPage, setPage: setOutPage, totalPages: outTotal, visibleRows: visibleOut } = paginatedOut;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitStockOut = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/out', {
        product_id: Number(form.productId),
        location_id: Number(form.locationId),
        quantity: Number(form.quantity),
        purpose: form.notes || 'Stock out',
        reference: form.destination || undefined,
        reason: form.notes,
      }, token);
      setMessage('Stock issued successfully.');
      setSubmitError('');
      setForm({ productId: '', locationId: '', quantity: 0, destination: '', notes: '' });
      loadRecords();
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

        <table className="table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Product</th>
              <th>Location</th>
              <th>Qty</th>
              <th>Purpose</th>
              <th>Issued By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleOut.length ? visibleOut.map((record) => (
              <tr key={record.id}>
                <td>{record.reference || `SO-${record.id}`}</td>
                <td>{record.product || 'Unknown'}</td>
                <td>{record.location || 'Unknown'}</td>
                <td>{record.quantity || 0}</td>
                <td>{record.purpose || 'Stock out'}</td>
                <td>{record.issued_by || 'System'}</td>
                <td>{record.issued_at ? new Date(record.issued_at).toLocaleDateString() : '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="empty-row">No stock-out records found.</td></tr>
            )}
          </tbody>
        </table>
        {records.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setOutPage((p) => Math.max(1, p - 1))} disabled={outPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {outPage}/{outTotal}</span>
            <button className="btn btn-light" onClick={() => setOutPage((p) => Math.min(outTotal, p + 1))} disabled={outPage >= outTotal}>Next</button>
          </div>
        )}

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
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 0, reference: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadRecords = async () => {
    try {
      const response = await apiGet('/stock/transfer', token);
      setRecords(response.data || []);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  useEffect(() => { loadRecords(); }, [token]);

  // pagination local to Transfers page
  const paginatedTransfersPage = usePaginatedRows(records, 10);
  const { page: transferPage, setPage: setTransferPage, totalPages: transferTotal, visibleRows: visibleTransfersPage } = paginatedTransfersPage;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/transfer', {
        product_id: Number(form.productId),
        from_location_id: Number(form.sourceLocationId),
        to_location_id: Number(form.destinationLocationId),
        quantity: Number(form.quantity),
        reference: form.reference,
      }, token);
      setMessage('Transfer created successfully.');
      setSubmitError('');
      setForm({ productId: '', sourceLocationId: '', destinationLocationId: '', quantity: 0, reference: '' });
      loadRecords();
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

        <table className="table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Product</th>
              <th>From</th>
              <th>To</th>
              <th>Qty</th>
              <th>By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransfersPage.length ? visibleTransfersPage.map((record) => (
              <tr key={record.id}>
                <td>{record.reference || `TR-${record.id}`}</td>
                <td>{record.product || 'Unknown'}</td>
                <td>{record.from_location || 'Unknown'}</td>
                <td>{record.to_location || 'Unknown'}</td>
                <td>{record.quantity || 0}</td>
                <td>{record.transferred_by || 'System'}</td>
                <td>{record.transferred_at ? new Date(record.transferred_at).toLocaleDateString() : '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="empty-row">No transfer records found.</td></tr>
            )}
          </tbody>
        </table>
            {records.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setTransferPage((p) => Math.max(1, p - 1))} disabled={transferPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {transferPage}/{transferTotal}</span>
            <button className="btn btn-light" onClick={() => setTransferPage((p) => Math.min(transferTotal, p + 1))} disabled={transferPage >= transferTotal}>Next</button>
          </div>
        )}

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
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ productId: '', locationId: '', quantity: 0, reason: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadRecords = async () => {
    try {
      const response = await apiGet('/stock/damage', token);
      setRecords(response.data || []);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  useEffect(() => { loadRecords(); }, [token]);
  const paginatedDamagedLocal = usePaginatedRows(records, 10);
  const { page: dmgPage, setPage: setDmgPage, totalPages: dmgTotal, visibleRows: visibleDamaged } = paginatedDamagedLocal;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitDamage = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/damage', {
        productId: Number(form.productId),
        locationId: Number(form.locationId),
        quantity: Number(form.quantity),
        reason: form.reason,
      }, token);
      setMessage('Damaged stock recorded.');
      setSubmitError('');
      setForm({ productId: '', locationId: '', quantity: 0, reason: '' });
      loadRecords();
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

        <table className="table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Reported By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleDamaged.length ? visibleDamaged.map((record) => (
              <tr key={record.id}>
                <td>{record.product || 'Unknown'}</td>
                <td>{record.location || 'Unknown'}</td>
                <td>{record.quantity || 0}</td>
                <td>{record.reason || '—'}</td>
                <td>{record.reported_by || 'System'}</td>
                <td>{record.created_at ? new Date(record.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="empty-row">No damaged stock records found.</td></tr>
            )}
          </tbody>
        </table>
        {records.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setDmgPage((p) => Math.max(1, p - 1))} disabled={dmgPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {dmgPage}/{dmgTotal}</span>
            <button className="btn btn-light" onClick={() => setDmgPage((p) => Math.min(dmgTotal, p + 1))} disabled={dmgPage >= dmgTotal}>Next</button>
          </div>
        )}

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
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ productId: '', quantity: 0, reason: '' });
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadRecords = async () => {
    try {
      const response = await apiGet('/stock/return', token);
      setRecords(response.data || []);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  useEffect(() => { loadRecords(); }, [token]);
  const paginatedReturnsLocal = usePaginatedRows(records, 10);
  const { page: retPage, setPage: setRetPage, totalPages: retTotal, visibleRows: visibleReturns } = paginatedReturnsLocal;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const submitReturn = async (event) => {
    event.preventDefault();
    try {
      await apiPost('/stock/return', {
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        reason: form.reason,
      }, token);
      setMessage('Return recorded successfully.');
      setSubmitError('');
      setForm({ productId: '', quantity: 0, reason: '' });
      loadRecords();
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

        <table className="table" style={{ marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Created By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {visibleReturns.length ? visibleReturns.map((record) => (
              <tr key={record.id}>
                <td>{record.product || 'Unknown'}</td>
                <td>{record.quantity || 0}</td>
                <td>{record.reason || '—'}</td>
                <td>{record.created_by || 'System'}</td>
                <td>{record.created_at ? new Date(record.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="empty-row">No return records found.</td></tr>
            )}
          </tbody>
        </table>
        {records.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setRetPage((p) => Math.max(1, p - 1))} disabled={retPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {retPage}/{retTotal}</span>
            <button className="btn btn-light" onClick={() => setRetPage((p) => Math.min(retTotal, p + 1))} disabled={retPage >= retTotal}>Next</button>
          </div>
        )}

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

  const paginatedMovements = usePaginatedRows(movements, 10);
  const { page: movPage, setPage: setMovPage, totalPages: movTotal, visibleRows: visibleMovements } = paginatedMovements;

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
            {visibleMovements.map((moment) => (
              <tr key={moment.id}>
                <td>{moment.type}</td>
                <td>{moment.product || 'Unknown'}</td>
                <td>{moment.location || 'Unknown'}</td>
                <td>{moment.quantity}</td>
                <td>{new Date(moment.createdAt).toLocaleString()}</td>
                <td>{moment.user || 'System'}</td>
              </tr>
            ))}
            {!visibleMovements.length && (
              <tr><td colSpan="6" className="empty-row">No stock movement records found.</td></tr>
            )}
          </tbody>
        </table>
        {movements.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setMovPage((p) => Math.max(1, p - 1))} disabled={movPage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {movPage}/{movTotal}</span>
            <button className="btn btn-light" onClick={() => setMovPage((p) => Math.min(movTotal, p + 1))} disabled={movPage >= movTotal}>Next</button>
          </div>
        )}
      </article>
    </section>
  );
};

export { StockInPage, StockOutPage, StockTransferPage, DamagedPage, ReturnsPage, StockMovementsPage };

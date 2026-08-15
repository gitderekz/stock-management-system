import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPost } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const initialForm = {
  purchaseOrderId: '',
  locationId: '',
  items: [{ productId: '', quantity: 0, unitCost: 0, condition: 'new' }],
  receivedDate: new Date().toISOString().split('T')[0],
  inspectionNotes: '',
  receivedBy: '',
};

const StockInPage = () => {
  const { token, user } = useAuth();
  const location = useLocation();
  const modal = useModal();
  const [stockInRecords, setStockInRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selectedPO, setSelectedPO] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [createdBatches, setCreatedBatches] = useState([]);
  // Advanced filters
  const [filters, setFilters] = useState({
    minDate: '',
    maxDate: '',
  });
  // Load data

  useEffect(() => {
    loadStockIn();
    loadPurchaseOrders();
    loadProducts();
    loadUsers();
    loadLocations();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const poId = params.get('po');
    if (poId) {
      handlePOSelect(poId);
    }
  }, [location.search, token]);

  const loadUsers = async () => {
    try {
      const res = await apiGet('/users', token);
      // API may return {success,data} or array
      setUsers(res.data || res);
    } catch (err) {
      // ignore
    }
  };

  const loadLocations = async () => {
    try {
      const res = await apiGet('/locations', token);
      setLocations(res.data || res);
    } catch (err) {
      // ignore
    }
  };

  const loadStockIn = async () => {
    try {
      const response = await apiGet('/stock/in', token);
      setStockInRecords(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await apiGet('/purchase-orders', token);
      setPurchaseOrders(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiGet('/products', token);
      setProducts(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const getProductName = (productId) => {
    return (
      products.find((p) => p.id === productId)?.name ||
      `Product #${productId}`
    );
  };

  const handlePOSelect = async (poId) => {
    const po = purchaseOrders.find((p) => String(p.id) === String(poId));
    let detailedPO = po;
    if (poId) {
      try {
        const response = await apiGet(`/purchase-orders/${poId}`, token);
        detailedPO = response.data || response;
      } catch (err) {
        console.warn('Could not load PO details for receiving:', err.message);
      }
    }

    setSelectedPO(detailedPO || null);
    setForm((prev) => ({
      ...prev,
      purchaseOrderId: poId,
      locationId: prev.locationId || locations[0]?.id || '',
      receivedBy: prev.receivedBy || user?.id || '',
      items: detailedPO?.items?.length
        ? detailedPO.items.map((it) => ({
            productId: it.product_id || it.productId || '',
            quantity: it.quantity || 0,
            unitCost: it.unit_cost || it.unitCost || 0,
            condition: 'new',
            locationId: prev.locationId || locations[0]?.id || '',
          }))
        : [{ productId: '', quantity: 0, unitCost: 0, condition: 'new', locationId: prev.locationId || locations[0]?.id || '' }],
    }));
  };

  const renderItemsToReceiveTable = () => {
    if (!selectedPO || !selectedPO.items || selectedPO.items.length === 0) {
      return <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>No items selected</div>;
    }
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Qty to Receive</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Unit Cost</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedPO.items.map((item, idx) => {
            const product = products.find((p) => p.id === (item.product_id || item.productId));
            const unitCost = parseFloat(item.unit_cost || item.unitCost || 0);
            const qty = parseInt(item.quantity || 0);
            return (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{product?.name || `Product #${item.product_id || item.productId}`}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{qty}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>TZS {unitCost.toLocaleString()}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>TZS {(unitCost * qty).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // when a PO is selected, populate line items from PO items
  useEffect(() => {
    if (selectedPO && selectedPO.items) {
      const mapped = selectedPO.items.map((it) => ({
        productId: it.product_id || it.productId || '',
        quantity: it.quantity || 0,
        unitCost: it.unit_cost || it.unitCost || 0,
        condition: 'new',
        locationId: form.locationId || locations[0]?.id || '',
      }));
      setForm((prev) => ({ ...prev, items: mapped, locationId: prev.locationId || locations[0]?.id || '' }));
    }
  }, [selectedPO, locations]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'receivedDate' ? value : value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: field === 'quantity' || field === 'unitCost' ? Number(value) : value };
      return { ...prev, items };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!form.purchaseOrderId) {
        setError('Please select a purchase order first');
        return;
      }

      if (form.items.length === 0 || form.items.some((item) => !item.productId || !item.quantity || item.quantity <= 0)) {
        setError('Please add at least one valid item to receive');
        return;
      }

      // Send a single request with items array to create batches server-side
      const payload = {
        purchase_order_id: form.purchaseOrderId || null,
        location_id: form.locationId || locations[0]?.id || null,
        items: form.items.map((item) => ({
          purchase_order_item_id: item.purchase_order_item_id || null,
          product_id: parseInt(item.productId),
          quantity_received: parseInt(item.quantity),
          unit_cost: parseFloat(item.unitCost) || 0,
          landed_cost: parseFloat(item.landedCost) || parseFloat(item.unitCost) || 0,
        })),
        inspection_notes: form.inspectionNotes || null,
        received_by: form.receivedBy || user?.id || null,
        received_at: form.receivedDate || new Date().toISOString().split('T')[0],
      };

      const response = await apiPost('/stock/in', payload, token);
      const result = response.data || response;
      if (result && result.success) {
        const batches = result.data?.batches || [];
        setCreatedBatches(batches.map((b) => ({ batch_number: b.batch_number || b.id, product_id: null, quantity_received: null })));
        setMessage('Goods received and batches created');
        setError('');
        setForm(initialForm);
        setSelectedPO(null);
        loadStockIn();
        setTimeout(() => {
          modal.close();
          setMessage('');
        }, 1800);
      } else {
        setError(result?.message || 'No batches were created');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRecords = stockInRecords.filter((record) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || (
      record.reference_number?.toLowerCase().includes(query) ||
      (record.purchaseOrder?.po_number || '')
        .toLowerCase()
        .includes(query)
    );

    const recordDate = new Date(record.created_at || record.received_date);
    const matchesMinDate = !filters.minDate || recordDate >= new Date(filters.minDate);
    const matchesMaxDate = !filters.maxDate || recordDate <= new Date(filters.maxDate);

    return matchesSearch && matchesMinDate && matchesMaxDate;
  });

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Goods Receipt (Stock In)</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <input
                type="search"
                className="text-input"
                placeholder="Search receipts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="toolbar-group">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setSelectedPO(null);
                  setForm(initialForm);
                  setError('');
                  modal.open();
                }}
              >
                + Receive Goods
              </button>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      {createdBatches.length > 0 && (
        <section className="panel alert alert-info">
          <h4>Created Stock Batches:</h4>
          <ul>
            {createdBatches.map((batch, idx) => (
              <li key={idx}>
                Batch {batch.batch_number}: {getProductName(batch.product_id)} (
                {batch.quantity_received} units)
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel filter-panel">
        <div className="filter-section">
          <h4 className="filter-title">Filters</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input 
                type="date" 
                className="text-input" 
                value={filters.minDate} 
                onChange={(e) => setFilters({...filters, minDate: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input 
                type="date" 
                className="text-input" 
                value={filters.maxDate} 
                onChange={(e) => setFilters({...filters, maxDate: e.target.value})}
              />
            </div>
            <div className="filter-group button-group">
              <button 
                className="btn btn-ghost" 
                onClick={() => setFilters({minDate: '', maxDate: ''})}
              >
                Clear Filters
              </button>
              <span className="filter-result">
                {filteredRecords.length} of {stockInRecords.length} records
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel table-panel">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>PO #</th>
              <th>Received Date</th>
              <th>Items</th>
              <th>Status</th>
              <th>Received By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="font-weight-bold">
                  {record.reference_number || `GR-${record.id}`}
                </td>
                <td>
                  {record.purchaseOrder?.po_number ||
                    `PO-${record.purchase_order_id}`}
                </td>
                <td>
                  {new Date(record.received_date).toLocaleDateString()}
                </td>
                <td>{record.items?.length || 0}</td>
                <td>
                  <span className="badge badge-success">Received</span>
                </td>
                <td>{record.received_by || 'System'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Receive Goods Modal */}
      <Modal
        isOpen={modal.isOpen}
        title="Receive Goods from Purchase Order"
        onClose={() => {
          modal.close();
          setSelectedPO(null);
          setForm(initialForm);
          setError('');
        }}
        size="large"
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          {!selectedPO ? (
            <>
              <div className="field-group full-width">
                <label className="field-label">Purchase Order *</label>
                <select
                  className="text-input"
                  value={form.purchaseOrderId}
                  onChange={(e) => handlePOSelect(e.target.value)}
                  required
                >
                  <option value="">Select PO to receive</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.po_number || `PO-${po.id}`} from{' '}
                      {po.supplier?.name || 'Unknown'} - Status:{' '}
                      {po.delivery_status}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="info-grid">
                <div className="info-item">
                  <label>Selected PO</label>
                  <div className="font-weight-bold">
                    {selectedPO.po_number || `PO-${selectedPO.id}`}
                  </div>
                </div>
                <div className="info-item">
                  <label>Supplier</label>
                  <div>{selectedPO.supplier?.name}</div>
                </div>
                <div className="info-item">
                  <label>PO Date</label>
                  <div>
                    {new Date(selectedPO.po_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="section-divider"></div>

              <div className="field-group">
                <label className="field-label">Received Date</label>
                <input
                  className="text-input"
                  type="date"
                  name="receivedDate"
                  value={form.receivedDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Location *</label>
                <select
                  className="text-input"
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Received By</label>
                <select
                  className="text-input"
                  name="receivedBy"
                  value={form.receivedBy}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select receiver</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName || u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="full-width">
                <h4>Items to Receive</h4>
                {renderItemsToReceiveTable()}
              </div>

              <div className="field-group full-width">
                <label className="field-label">Inspection Notes</label>
                <textarea
                  className="text-input"
                  name="inspectionNotes"
                  value={form.inspectionNotes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any issues or notes about the delivery..."
                />
              </div>
            </>
          )}

          <div className="form-actions full-width">
            {selectedPO && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedPO(null);
                  setForm(initialForm);
                }}
              >
                Back to PO Selection
              </button>
            )}
            {selectedPO && (
              <button type="submit" className="btn btn-primary">
                Receive Goods
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                modal.close();
                setSelectedPO(null);
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

export default StockInPage;

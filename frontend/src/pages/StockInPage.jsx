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
  const viewModal = useModal();
  const [stockInRecords, setStockInRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selectedPO, setSelectedPO] = useState(null);
  const [viewingStockIn, setViewingStockIn] = useState(null);
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
            id: it.id || null,
            purchase_order_item_id: it.id || null,
            productId: it.product_id || it.productId || '',
            quantity: it.quantity || 0,
            unitCost: it.unit_cost || it.unitCost || 0,
            unitSellingPrice: it.unit_selling_price ?? it.unitSellingPrice ?? it.unit_cost ?? 0,
            landedCost: it.landed_cost || it.landedCost || 0,
            condition: 'new',
            locationId: prev.locationId || locations[0]?.id || '',
          }))
        : [{ productId: '', quantity: 0, unitCost: 0, landedCost: 0, condition: 'new', locationId: prev.locationId || locations[0]?.id || '' }],
    }));
  };

  const renderItemsToReceiveTable = () => {
    if (!selectedPO || !selectedPO.items || selectedPO.items.length === 0) {
      return <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>No items selected</div>;
    }
    const rows = selectedPO.items.map((item, idx) => {
      const product = products.find((p) => p.id === (item.product_id || item.productId));
      const qty = Number(item.quantity || 0);
      const unitCost = Number(item.unit_cost || item.unitCost || 0);
      const total = qty * unitCost;
      return { product, qty, unitCost, total, idx };
    });
    const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
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
          {rows.map(({ product, qty, unitCost, total, idx }) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{product?.name || `Product #${selectedPO.items[idx].product_id || selectedPO.items[idx].productId}`}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{qty}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>TZS {unitCost.toLocaleString()}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>TZS {total.toLocaleString()}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #ddd', background: '#f8fafc', fontWeight: 700 }}>
            <td style={{ padding: '8px' }}>Total</td>
            <td style={{ padding: '8px', textAlign: 'center' }}>{rows.reduce((sum, row) => sum + row.qty, 0)}</td>
            <td style={{ padding: '8px', textAlign: 'center' }}>—</td>
            <td style={{ padding: '8px', textAlign: 'center' }}>TZS {grandTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  // when a PO is selected, populate line items from PO items
  useEffect(() => {
    if (selectedPO && selectedPO.items) {
      const mapped = selectedPO.items.map((it) => ({
        id: it.id || null,
        purchase_order_item_id: it.id || null,
        productId: it.product_id || it.productId || '',
        quantity: it.quantity || 0,
        unitCost: it.unit_cost || it.unitCost || 0,
        unitSellingPrice: it.unit_selling_price ?? it.unitSellingPrice ?? it.unit_cost ?? 0,
        landedCost: it.landed_cost || it.landedCost || 0,
        condition: 'new',
        locationId: form.locationId || locations[0]?.id || '',
      }));
      setForm((prev) => ({ ...prev, items: mapped, locationId: prev.locationId || locations[0]?.id || '' }));
    }
  }, [selectedPO, locations]);

  const poDate = selectedPO ? (selectedPO.order_date || selectedPO.orderDate || selectedPO.createdAt || selectedPO.created_at) : null;

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

  const handleViewStockIn = async (id) => {
    try {
      const response = await apiGet(`/stock/in/${id}`, token);
      setViewingStockIn(response.data || response);
      viewModal.open();
    } catch (err) {
      setError(`Failed to load stock-in details: ${err.message}`);
    }
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

      const payload = {
        purchase_order_id: form.purchaseOrderId || null,
        location_id: form.locationId || locations[0]?.id || null,
        items: form.items.map((item) => ({
          purchase_order_item_id: item.purchase_order_item_id || null,
          product_id: parseInt(item.productId),
          quantity_received: parseInt(item.quantity),
          unit_cost: parseFloat(item.unitCost) || 0,
          unit_selling_price: parseFloat(item.unitSellingPrice ?? item.unitCost ?? 0) || 0,
          landed_cost: parseFloat(item.landedCost) || parseFloat(item.unitCost) || 0,
        })),
        inspection_notes: form.inspectionNotes || null,
        received_by: form.receivedBy || user?.id || null,
        received_at: form.receivedDate || new Date().toISOString().split('T')[0],
      };

      const response = await apiPost('/stock/in', payload, token);
      const result = response.data || response;
      
      // Check for successful response and batches in multiple possible structures
      const batches = result?.data?.batches || result?.batches || [];
      const isSuccess = result?.success === true || (response?.status >= 200 && response?.status < 300) || batches.length > 0;
      
      if (isSuccess && batches.length > 0) {
        setCreatedBatches(batches.map((b) => ({ batch_number: b.batch_number || b.id, product_id: null, quantity_received: null })));
        setMessage('Goods received and batches created successfully');
        setError('');
        setForm(initialForm);
        setSelectedPO(null);
        await loadStockIn();
        modal.close();
      } else if (result?.success || response?.status >= 200 && response?.status < 300) {
        // Success response but possibly no batches returned (edge case)
        setMessage(result?.message || 'Goods received');
        setError('');
        setForm(initialForm);
        setSelectedPO(null);
        await loadStockIn();
        modal.close();
      } else {
        setError(result?.message || 'Failed to receive goods');
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

  // pagination for stock-in records
  const usePaginatedRows = (rows, pageSize = 10) => {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [rows?.length]);
    const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const visibleRows = rows?.slice(startIndex, startIndex + pageSize) || [];
    return { page: safePage, setPage, totalPages, visibleRows };
  };

  const paginated = usePaginatedRows(filteredRecords, 10);
  const { page, setPage, totalPages, visibleRows } = paginated;

  const formatReceiptDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString();
  };

  const getReceiptPoNumber = (record) => {
    return (
      record?.purchaseOrder?.po_number ||
      record?.purchase_order?.po_number ||
      record?.po_number ||
      (record?.purchase_order_id ? `PO-${record.purchase_order_id}` : '—')
    );
  };

  const getReceiptItemCount = (record) => {
    if (Array.isArray(record?.items)) return record.items.length;
    return Number(record?.items_count || 0);
  };

  const getReceiptReceiverName = (record) => {
    return (
      record?.receiver?.fullName ||
      record?.receiver?.name ||
      record?.received_by ||
      'System'
    );
  };

  // Filter purchase orders that are ready to receive (COMPLETED, PAID, RECEIVED)
  // Exclude POs that have already been received to prevent duplicate receipts
  const readyPurchaseOrders = purchaseOrders.filter((po) => {
    const poStatus = String(po.po_status || '').toUpperCase();
    const paymentStatus = String(po.payment_status || '').toUpperCase();
    const deliveryStatus = String(po.delivery_status || '').toUpperCase();
    const alreadyReceived = stockInRecords.some(r => r.purchase_order_id === po.id);
    return poStatus === 'COMPLETED' && paymentStatus === 'PAID' && deliveryStatus === 'RECEIVED' && !alreadyReceived;
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
            {visibleRows.map((record) => (
              <tr key={record.id}>
                <td className="font-weight-bold">
                  {record.reference_number || `GR-${record.id}`}
                </td>
                <td>{getReceiptPoNumber(record)}</td>
                <td>{formatReceiptDate(record.received_date || record.receipt_date || record.created_at || record.createdAt)}</td>
                <td>{getReceiptItemCount(record)}</td>
                <td>
                  <span className="badge badge-success">{record.status || 'Received'}</span>
                </td>
                <td>{getReceiptReceiverName(record)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleViewStockIn(record.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {page}/{totalPages}</span>
            <button className="btn btn-light" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </div>
        )}
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
                  {readyPurchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.po_number || `PO-${po.id}`} from {po.supplier?.name || po.supplier || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px 20px', marginBottom: '16px' }}>
                <div className="info-item">
                  <label>Selected PO</label>
                  <div className="font-weight-bold">{selectedPO?.po_number || selectedPO?.purchase_order_no || (selectedPO?.id ? `PO-${selectedPO.id}` : '—')}</div>
                </div>
                <div className="info-item">
                  <label>Supplier</label>
                  <div>{selectedPO?.supplier?.name || selectedPO?.supplier || '—'}</div>
                </div>
                <div className="info-item">
                  <label>PO Date</label>
                  <div>{formatReceiptDate(poDate)}</div>
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

      {/* View Stock-In Details Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        title="Stock-In Details"
        onClose={() => {
          viewModal.close();
          setViewingStockIn(null);
        }}
        size="large"
      >
        {viewingStockIn && (
          <>
            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px 20px', marginBottom: '20px' }}>
              <div className="info-item">
                <label>Reference Number</label>
                <div className="font-weight-bold">{viewingStockIn.reference_number || `GR-${viewingStockIn.id}`}</div>
              </div>
              <div className="info-item">
                <label>Purchase Order</label>
                <div>{viewingStockIn.purchaseOrder?.po_number || viewingStockIn.purchase_order?.po_number || (viewingStockIn.purchase_order_id ? `PO-${viewingStockIn.purchase_order_id}` : '—')}</div>
              </div>
              <div className="info-item">
                <label>Received Date</label>
                <div>{formatReceiptDate(viewingStockIn.received_date || viewingStockIn.receipt_date || viewingStockIn.created_at || viewingStockIn.createdAt)}</div>
              </div>
              <div className="info-item">
                <label>Location</label>
                <div>{viewingStockIn.location?.name || viewingStockIn.location_id}</div>
              </div>
              <div className="info-item">
                <label>Received By</label>
                <div>{viewingStockIn.receiver?.fullName || viewingStockIn.receiver?.name || viewingStockIn.received_by || 'System'}</div>
              </div>
              <div className="info-item">
                <label>Total Cost</label>
                <div className="font-weight-bold">TZS {(viewingStockIn.total_cost || 0).toLocaleString()}</div>
              </div>
              <div className="info-item">
                <label>Status</label>
                <div><span className="badge badge-success">{viewingStockIn.status || 'Received'}</span></div>
              </div>
              <div className="info-item">
                <label>Inspection Notes</label>
                <div style={{whiteSpace: 'pre-wrap'}}>{viewingStockIn.notes || '—'}</div>
              </div>
            </div>

            {viewingStockIn.items && viewingStockIn.items.length > 0 && (
              <>
                <div className="section-divider" style={{margin: '20px 0'}}></div>
                <h4 style={{marginBottom: '10px'}}>Received Items</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{textAlign: 'center'}}>Quantity</th>
                      <th style={{textAlign: 'center'}}>Unit Cost</th>
                      <th style={{textAlign: 'center'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingStockIn.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.product_id);
                      const unitCost = parseFloat(item.unit_price || 0);
                      const qty = parseInt(item.quantity || 0);
                      return (
                        <tr key={idx}>
                          <td>{product?.name || `Product #${item.product_id}`}</td>
                          <td style={{textAlign: 'center'}}>{qty}</td>
                          <td style={{textAlign: 'center'}}>TZS {unitCost.toLocaleString()}</td>
                          <td style={{textAlign: 'center'}}>TZS {(unitCost * qty).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default StockInPage;

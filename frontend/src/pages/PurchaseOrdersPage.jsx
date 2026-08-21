import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  supplier_id: '',
  po_number: '',
  expected_delivery: '',
  notes: '',
  items: [],
};

const PurchaseOrdersPage = () => {
  const { token } = useAuth();
  const modal = useModal();
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/purchase-orders', token);
      setPurchaseOrders(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await apiGet('/suppliers', token);
      setSuppliers(response.data || []);
    } catch (err) {
      console.warn('Could not load suppliers:', err.message);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiGet('/products', token);
      setProducts(response.data || []);
    } catch (err) {
      console.warn('Could not load products:', err.message);
    }
  };

  const loadPurchaseOrderDetails = async (poId) => {
    try {
      const response = await apiGet(`/purchase-orders/${poId}`, token);
      const po = response.data || response;
      return po;
    } catch (err) {
      console.warn('Could not load PO details:', err.message);
      return null;
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, [token]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        (po.po_number || '').toLowerCase().includes(query) ||
        (po.supplier || '').toLowerCase().includes(query) ||
        (po.notes || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || po.po_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  // pagination for purchase orders
  const usePaginatedRows = (rows, pageSize = 10) => {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [rows?.length]);
    const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const visibleRows = rows?.slice(startIndex, startIndex + pageSize) || [];
    return { page: safePage, setPage, totalPages, visibleRows };
  };

  const paginated = usePaginatedRows(filteredPOs, 10);
  const { page, setPage, totalPages, visibleRows } = paginated;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'supplier_id' ? Number(value) : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: ['product_id'].includes(field) ? Number(value) : Number(value) || value,
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: '',
          quantity: 1,
          unit_cost: 0,
          unit_selling_price: 0,
          shipping_per_unit: 0,
          tariff_per_unit: 0,
          tax_per_unit: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const openPOModal = async (po = null) => {
    if (po) {
      const detailedPO = await loadPurchaseOrderDetails(po.id);
      const sourcePO = detailedPO || po;
      setEditing(sourcePO);
      setForm({
        supplier_id: sourcePO.supplier_id || sourcePO.supplier?.id || '',
        po_number: sourcePO.po_number || '',
        expected_delivery: sourcePO.expected_delivery ? sourcePO.expected_delivery.split('T')[0] : '',
        notes: sourcePO.notes || '',
        items: (sourcePO.items || []).map((item) => ({
          id: item.id,
          product_id: item.product_id || item.productId || '',
          quantity: item.quantity || 0,
          unit_cost: item.unit_cost || 0,
          unit_selling_price: item.unit_selling_price || 0,
          shipping_per_unit: item.shipping_per_unit || 0,
          tariff_per_unit: item.tariff_per_unit || 0,
          tax_per_unit: item.tax_per_unit || 0,
          landed_cost: item.landed_cost || 0,
        })),
      });
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setError('');
    setMessage('');
    modal.open();
  };

  const handleViewPO = async (poId) => {
    const po = await loadPurchaseOrderDetails(poId);
    if (po) {
      setSelectedPO(po);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!form.supplier_id) {
        setError('Please select a supplier');
        return;
      }

      if (!form.po_number) {
        setError('Please enter a PO number');
        return;
      }

      if (form.items.length === 0 || form.items.some((i) => !i.product_id || i.quantity <= 0 || !i.unit_cost)) {
        setError('Please add at least one item with product, quantity, and unit cost');
        return;
      }

      const payload = {
        supplier_id: Number(form.supplier_id),
        po_number: form.po_number,
        expected_delivery: form.expected_delivery || null,
        notes: form.notes || null,
        items: form.items,
      };

      let response;
      if (editing) {
        response = await apiPut(`/purchase-orders/${editing.id}`, payload, token);
        setPurchaseOrders((prev) =>
          prev.map((item) => (item.id === editing.id ? response.data : item))
        );
        setMessage('Purchase order updated successfully.');
      } else {
        response = await apiPost('/purchase-orders', payload, token);
        setPurchaseOrders((prev) => [response.data, ...prev]);
        setMessage('Purchase order created successfully.');
      }

      setEditing(null);
      setForm(initialForm);
      setError('');
      modal.close();
    } catch (err) {
      setError(err.message || 'Failed to save purchase order');
    }
  };

  const handleDelete = async (poId) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      await apiDelete(`/purchase-orders/${poId}`, token);
      setPurchaseOrders((prev) => prev.filter((item) => item.id !== poId));
      setMessage('Purchase order deleted successfully.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const calculatePOTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (parseFloat(item.unit_cost) || 0), 0);
  };

  const calculateLandedCost = (item) => {
    return (
      parseFloat(item.unit_cost || 0) +
      parseFloat(item.shipping_per_unit || 0) +
      parseFloat(item.tariff_per_unit || 0) +
      parseFloat(item.tax_per_unit || 0)
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: 'badge-info',
      ORDERED: 'badge-warning',
      PARTIALLY_RECEIVED: 'badge-primary',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.sku || ''})` : `Product #${productId}`;
  };

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Procurement</div>
            <h3 className="panel-title">Purchase Orders</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <input
                type="search"
                className="text-input"
                placeholder="Search POs..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="text-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="toolbar-group">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => openPOModal()}
              >
                + New PO
              </button>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      {loading ? (
        <div className="panel"><p>Loading...</p></div>
      ) : (
        <section className="panel table-panel">
          <table className="table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>PO Status</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((po) => (
                <tr key={po.id}>
                  <td className="font-weight-bold">{po.po_number}</td>
                  <td>{po.supplier}</td>
                  <td>{po.item_count || 0} items</td>
                  <td>TZS {Number(po.total_amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(po.po_status)}`}>
                      {po.po_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${po.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {po.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${po.delivery_status === 'RECEIVED' ? 'badge-success' : 'badge-info'}`}>
                      {po.delivery_status}
                    </span>
                  </td>
                  <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleViewPO(po.id)}
                    >
                      View
                    </button>
                    {po.po_status === 'DRAFT' && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openPOModal(po)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(po.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPOs.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
              <button className="btn btn-light" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span style={{ fontSize: 12, color: '#475569' }}>Page {page}/{totalPages}</span>
              <button className="btn btn-light" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
            </div>
          )}
          {filteredPOs.length === 0 && !loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No purchase orders found.
            </div>
          )}
        </section>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <Modal
          isOpen={!!selectedPO}
          title={`Purchase Order ${selectedPO.po_number}`}
          onClose={() => setSelectedPO(null)}
          size="large"
        >
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Supplier</label>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>{selectedPO.supplier?.name || selectedPO.supplier || 'Unknown'}</div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>PO Status</label>
                <div style={{ marginTop: '5px' }}>
                  <span className={`badge ${getStatusBadge(selectedPO.po_status)}`}>
                    {selectedPO.po_status}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Payment Status</label>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>{selectedPO.payment_status}</div>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Delivery Status</label>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>{selectedPO.delivery_status}</div>
              </div>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Line Items</h4>
            <table 
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Unit Cost</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Selling Price</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Landed Cost</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '10px' }}>{getProductName(item.product_id)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>TZS {Number(item.unit_cost || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>TZS {Number(item.unit_selling_price || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>TZS {Number(item.landed_cost || calculateLandedCost(item)).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      TZS {((item.quantity || 0) * parseFloat(item.unit_cost || 0)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'right', marginBottom: '20px' }}>
              Total: TZS {Number(selectedPO.total_amount || 0).toLocaleString()}
            </div>

            {selectedPO.notes && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Notes</label>
                <div style={{ fontSize: '13px', color: '#555', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {selectedPO.notes}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Update Status</h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>PO Status</label>
                  <select
                    value={selectedPO.po_status || 'DRAFT'}
                    onChange={(event) => setSelectedPO((prev) => ({ ...prev, po_status: event.target.value }))}
                    style={{ padding: '8px', borderRadius: '6px' }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ORDERED">ORDERED</option>
                    <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Payment Status</label>
                  <select
                    value={selectedPO.payment_status || 'UNPAID'}
                    onChange={(event) => setSelectedPO((prev) => ({ ...prev, payment_status: event.target.value }))}
                    style={{ padding: '8px', borderRadius: '6px' }}
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                    <option value="PAID">PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Delivery Status</label>
                  <select
                    value={selectedPO.delivery_status || 'PENDING'}
                    onChange={(event) => setSelectedPO((prev) => ({ ...prev, delivery_status: event.target.value }))}
                    style={{ padding: '8px', borderRadius: '6px' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</option>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        const resp = await apiPut(
                          `/purchase-orders/${selectedPO.id}`,
                          {
                            po_status: selectedPO.po_status,
                            payment_status: selectedPO.payment_status,
                            delivery_status: selectedPO.delivery_status,
                          },
                          token
                        );
                        const updatedPO = resp.data || selectedPO;
                        setSelectedPO(updatedPO);
                        setPurchaseOrders((prev) => prev.map((p) => (p.id === updatedPO.id ? updatedPO : p)));
                        setMessage('Status updated');
                      } catch (err) {
                        setError(err.message || 'Failed to update status');
                      }
                    }}
                  >
                    Save Status
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <button
                className="btn btn-info"
                onClick={() => {
                  modal.close();
                  navigate(`/stock/in?po=${selectedPO.id}`);
                }}
              >
                Receive Goods
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setSelectedPO(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit PO Modal */}
      <Modal
        isOpen={modal.isOpen}
        title={editing ? 'Edit Purchase Order' : 'Create Purchase Order'}
        onClose={() => {
          modal.close();
          setEditing(null);
          setForm(initialForm);
          setError('');
        }}
        size="large"
      >
        <form className="form-grid" onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>{error}</div>}

          <div className="field-group">
            <label className="field-label">Supplier *</label>
            <select
              className="text-input"
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">PO Number *</label>
            <input
              className="text-input"
              type="text"
              name="po_number"
              value={form.po_number}
              onChange={handleChange}
              placeholder="e.g., PO-2026-001"
              required
              disabled={editing}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Expected Delivery Date</label>
            <input
              className="text-input"
              type="date"
              name="expected_delivery"
              value={form.expected_delivery}
              onChange={handleChange}
            />
          </div>

          <div className="field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Notes</label>
            <textarea
              className="text-input"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Line Items Section */}
          <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>Line Items</h4>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={addItem}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {form.items.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#999' }}>
                No items added yet. Click "Add Item" to get started.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Unit Cost</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Selling Price</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Shipping</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Tariff</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Tax</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '8px' }}>
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              width: '100%',
                            }}
                            required
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_cost}
                            onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_selling_price}
                            onChange={(e) => handleItemChange(idx, 'unit_selling_price', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.shipping_per_unit}
                            onChange={(e) => handleItemChange(idx, 'shipping_per_unit', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tariff_per_unit}
                            onChange={(e) => handleItemChange(idx, 'tariff_per_unit', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tax_per_unit}
                            onChange={(e) => handleItemChange(idx, 'tax_per_unit', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                          TZS {((item.quantity || 0) * parseFloat(item.unit_cost || 0)).toLocaleString()}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeItem(idx)}
                            style={{ padding: '4px 8px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
              Total PO Amount: TZS {calculatePOTotal(form.items).toLocaleString()}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                modal.close();
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Update' : 'Create'} Purchase Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;

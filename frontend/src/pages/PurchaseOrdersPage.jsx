import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const initialForm = {
  supplierId: '',
  poDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: '',
  items: [{ productId: '', quantity: 0, unitPrice: 0 }],
};

const PurchaseOrdersPage = () => {
  const { token } = useAuth();
  const modal = useModal();
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

  // Load data
  const loadPurchaseOrders = async () => {
    try {
      const response = await apiGet('/purchase-orders', token);
      setPurchaseOrders(response.data || []);
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

  const loadProducts = async () => {
    try {
      const response = await apiGet('/products', token);
      setProducts(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        (po.po_number || '').toLowerCase().includes(query) ||
        (po.supplier?.name || '').toLowerCase().includes(query) ||
        (po.notes || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || po.po_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'supplierId' ? Number(value) : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'productId' ? Number(value) : Number(value) }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 0, unitPrice: 0 }],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const openPOModal = (po = null) => {
    if (po) {
      setEditing(po);
      setForm({
        supplierId: po.supplier_id || '',
        poDate: po.po_date?.split('T')[0] || '',
        expectedDeliveryDate: po.expected_delivery_date?.split('T')[0] || '',
        notes: po.notes || '',
        items: po.items || [{ productId: '', quantity: 0, unitPrice: 0 }],
      });
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setError('');
    setMessage('');
    modal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!form.supplierId) {
        setError('Please select a supplier');
        return;
      }

      if (form.items.length === 0 || form.items.some((i) => !i.productId || i.quantity <= 0)) {
        setError('Please add at least one valid item');
        return;
      }

      const payload = {
        supplier_id: form.supplierId,
        po_date: form.poDate,
        expected_delivery_date: form.expectedDeliveryDate,
        notes: form.notes,
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
      setError(err.message);
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

  const handleStatusChange = async (poId, newStatus) => {
    try {
      const response = await apiPut(
        `/purchase-orders/${poId}/transition`,
        { po_status: newStatus },
        token
      );
      setPurchaseOrders((prev) =>
        prev.map((item) => (item.id === poId ? response.data : item))
      );
      setMessage('Purchase order status updated.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const calculatePOTotal = (items) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'badge-info',
      ordered: 'badge-warning',
      received: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return statusMap[status] || 'badge-secondary';
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
                <option value="draft">Draft</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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

      <section className="panel table-panel">
        <table className="table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>PO Status</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.map((po) => (
              <tr key={po.id}>
                <td className="font-weight-bold">{po.po_number || `PO-${po.id}`}</td>
                <td>{po.supplier?.name || 'Unknown'}</td>
                <td>{new Date(po.po_date).toLocaleDateString()}</td>
                <td>{po.items?.length || 0} items</td>
                <td>TZS {calculatePOTotal(po.items || []).toLocaleString()}</td>
                <td>
                  <span className={`badge ${getStatusBadge(po.po_status)}`}>
                    {po.po_status || 'draft'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${po.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {po.payment_status || 'pending'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${po.delivery_status === 'delivered' ? 'badge-success' : 'badge-info'}`}>
                    {po.delivery_status || 'pending'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedPO(po)}
                  >
                    View
                  </button>
                  {po.po_status === 'draft' && (
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
      </section>

      {/* PO Detail Modal */}
      {selectedPO && (
        <Modal
          isOpen={!!selectedPO}
          title={`Purchase Order ${selectedPO.po_number || `#${selectedPO.id}`}`}
          onClose={() => setSelectedPO(null)}
          size="large"
        >
          <div className="modal-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Supplier</label>
                <div>{selectedPO.supplier?.name || 'Unknown'}</div>
              </div>
              <div className="info-item">
                <label>PO Date</label>
                <div>{new Date(selectedPO.po_date).toLocaleDateString()}</div>
              </div>
              <div className="info-item">
                <label>Expected Delivery</label>
                <div>{new Date(selectedPO.expected_delivery_date).toLocaleDateString()}</div>
              </div>
              <div className="info-item">
                <label>Status</label>
                <div className={`badge ${getStatusBadge(selectedPO.po_status)}`}>
                  {selectedPO.po_status || 'draft'}
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            <h4>Items</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {
                        products.find((p) => p.id === item.productId)
                          ?.name || `Product #${item.productId}`
                      }
                    </td>
                    <td>{item.quantity}</td>
                    <td>TZS {Number(item.unitPrice).toLocaleString()}</td>
                    <td>TZS {(item.quantity * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="info-grid">
              <div className="info-item">
                <label>Total Amount</label>
                <div className="font-large font-weight-bold">
                  TZS {calculatePOTotal(selectedPO.items || []).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="action-row">
              {selectedPO.po_status === 'draft' && (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleStatusChange(selectedPO.id, 'ordered')
                  }
                >
                  Mark as Ordered
                </button>
              )}
              {selectedPO.po_status === 'ordered' && (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleStatusChange(selectedPO.id, 'received')
                  }
                >
                  Mark as Received
                </button>
              )}
              {(selectedPO.po_status === 'received' ||
                selectedPO.po_status === 'ordered') && (
                <button
                  className="btn btn-info"
                  onClick={() => {
                    /* Navigate to Stock In */
                  }}
                >
                  Receive Goods
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setSelectedPO(null)}>
                Close
              </button>
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
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Supplier *</label>
            <select
              className="text-input"
              name="supplierId"
              value={form.supplierId}
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
            <label className="field-label">PO Date</label>
            <input
              className="text-input"
              type="date"
              name="poDate"
              value={form.poDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Expected Delivery Date</label>
            <input
              className="text-input"
              type="date"
              name="expectedDeliveryDate"
              value={form.expectedDeliveryDate}
              onChange={handleChange}
            />
          </div>

          <div className="field-group full-width">
            <label className="field-label">Notes</label>
            <textarea
              className="text-input"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="full-width">
            <h4>Items</h4>
            {form.items.map((item, index) => (
              <div key={index} className="item-row">
                <select
                  className="text-input"
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, 'productId', e.target.value)
                  }
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="text-input"
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, 'quantity', e.target.value)
                  }
                  required
                />
                <input
                  className="text-input"
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, 'unitPrice', e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-light"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Create PO'}
            </button>
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

export default PurchaseOrdersPage;

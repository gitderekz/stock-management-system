import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPost } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const initialForm = {
  purchaseOrderId: '',
  items: [{ productId: '', quantity: 0, unitCost: 0, condition: 'new' }],
  receivedDate: new Date().toISOString().split('T')[0],
  inspectionNotes: '',
  receivedBy: '',
};

const StockInPage = () => {
  const { token, user } = useAuth();
  const modal = useModal();
  const [stockInRecords, setStockInRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
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
  }, []);

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

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find((p) => String(p.id) === String(poId));
    setSelectedPO(po || null);
    setForm((prev) => ({ ...prev, purchaseOrderId: poId }));
  };

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
      if (!form.purchaseOrderId && form.items.length === 0) {
        setError('Please select a PO and at least one item');
        return;
      }

      const created = [];
      for (const item of form.items) {
        if (!item.productId || item.quantity <= 0) continue;
        const payload = {
          product_id: parseInt(item.productId),
          location_id: item.locationId || null,
          quantity_received: parseInt(item.quantity),
          purchase_order_id: form.purchaseOrderId || null,
          unit_cost: parseFloat(item.unitCost) || 0,
          landed_cost: parseFloat(item.landedCost) || parseFloat(item.unitCost) || 0,
          condition: item.condition || 'new',
          inspection_notes: form.inspectionNotes || null,
        };

        const response = await apiPost('/stock/in', payload, token);
        if (response && response.data) {
          created.push(response.data);
        }
      }

      if (created.length > 0) {
        setCreatedBatches(created.map((c) => ({ batch_number: c.batch_number, product_id: c.product, quantity_received: c.quantity_received })));
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
        setError('No batches were created');
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
                <label className="field-label">Received By</label>
                <input
                  className="text-input"
                  type="text"
                  name="receivedBy"
                  value={form.receivedBy}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="full-width">
                <h4>Items to Receive</h4>
                {form.items.map((item, index) => (
                  <div key={index} className="item-grid">
                    <div>
                      <label>Product:</label>
                      <div className="font-weight-bold">
                        {getProductName(item.productId)}
                      </div>
                    </div>
                    <div>
                      <label>Quantity *</label>
                      <input
                        className="text-input"
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'quantity',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <label>Unit Cost</label>
                      <input
                        className="text-input"
                        type="number"
                        placeholder="Cost"
                        value={item.unitCost}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'unitCost',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label>Condition</label>
                      <select
                        className="text-input"
                        value={item.condition}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'condition',
                            e.target.value
                          )
                        }
                      >
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                ))}
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

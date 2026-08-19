import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPost } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const initialForm = {
  productId: '',
  locationId: '',
  quantity: 0,
  purpose: 'sale',
  reference: '',
  allocationMode: 'automatic',
  selectedBatches: [],
};

const StockOutPage = () => {
  const { token, user } = useAuth();
  const modal = useModal();
  const viewModal = useModal();
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [viewingStockOut, setViewingStockOut] = useState(null);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [allocationResult, setAllocationResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    productId: '',
    locationId: '',
    purpose: '',
    minDate: '',
    maxDate: '',
  });

  // Load data
  const loadStockOut = async () => {
    try {
      const response = await apiGet('/stock/out', token);
      setStockOutRecords(response.data || []);
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

  const loadLocations = async () => {
    try {
      const response = await apiGet('/locations', token);
      setLocations(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadBatches = async (productId, locationId) => {
    if (!productId || !locationId) {
      setBatches([]);
      return;
    }
    try {
      const response = await apiGet(
        `/stock/batches?productId=${productId}&locationId=${locationId}`,
        token
      );
      const sorted = (response.data || []).sort(
        (a, b) => new Date(a.received_at) - new Date(b.received_at)
      );
      setBatches(sorted);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadStockOut();
    loadProducts();
    loadLocations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));

    if (name === 'productId' || name === 'locationId') {
      const prodId = name === 'productId' ? value : form.productId;
      const locId = name === 'locationId' ? value : form.locationId;
      loadBatches(prodId, locId);
    }
  };

  const calculateFIFOAllocation = () => {
    if (!form.productId || !form.locationId || form.quantity <= 0) {
      setError('Please select product, location, and enter quantity');
      return;
    }

    const allocation = [];
    let remainingQty = form.quantity;
    let totalCost = 0;

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const qtyToTake = Math.min(
        remainingQty,
        batch.quantity_remaining || 0
      );

      if (qtyToTake > 0) {
        const unitPrice = Number(batch.unit_selling_price ?? batch.unit_cost ?? 0);
        const batchCost = qtyToTake * unitPrice;
        allocation.push({
          batchId: batch.id,
          batchNumber: batch.batch_number,
          quantity: qtyToTake,
          unitCost: unitPrice,
          totalCost: batchCost,
          receivedAt: batch.received_at,
          expiresAt: batch.expires_at,
          condition: batch.condition,
          quantityAvailable: batch.quantity_remaining || 0,
        });
        totalCost += batchCost;
        remainingQty -= qtyToTake;
      }
    }

    if (remainingQty > 0) {
      setError(
        `Only ${form.quantity - remainingQty} units available (need ${form.quantity})`
      );
      setAllocationResult(null);
      return;
    }

    setAllocationResult({
      allocation,
      totalQtyAllocated: form.quantity,
      totalCost,
      allBatchesAllocated: allocation,
    });
    setError('');
    setForm((prev) => ({
      ...prev,
      selectedBatches: allocation.map((a) => ({
        batchId: a.batchId,
        quantity: a.quantity,
      })),
    }));
  };

  const handleManualBatchSelect = (batchId, quantity) => {
    setForm((prev) => {
      const existing = prev.selectedBatches.find(
        (b) => b.batchId === batchId
      );
      if (existing) {
        return {
          ...prev,
          selectedBatches: prev.selectedBatches.map((b) =>
            b.batchId === batchId ? { ...b, quantity } : b
          ),
        };
      } else {
        return {
          ...prev,
          selectedBatches: [
            ...prev.selectedBatches,
            { batchId, quantity },
          ],
        };
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!form.productId || !form.locationId) {
        setError('Please select product and location');
        return;
      }

      if (form.selectedBatches.length === 0) {
        setError('Please select batches for allocation');
        return;
      }

      const payload = {
        product_id: parseInt(form.productId),
        location_id: parseInt(form.locationId),
        quantity: form.quantity,
        purpose: form.purpose,
        reference: form.reference,
        batch_allocations: form.selectedBatches,
        issued_by: user?.id || 1,
      };

      const endpoint =
        form.allocationMode === 'automatic'
          ? '/stock/out'
          : '/stock/out/manual';

      const response = await apiPost(endpoint, payload, token);
      setStockOutRecords((prev) => [response.data, ...prev]);
      setMessage('Stock issued successfully!');
      setError('');
      setForm(initialForm);
      setAllocationResult(null);
      setTimeout(() => {
        modal.close();
        setMessage('');
      }, 2000);
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

  const getLocationName = (locationId) => {
    return (
      locations.find((l) => l.id === locationId)?.name ||
      `Location #${locationId}`
    );
  };

  const filteredRecords = stockOutRecords.filter((record) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || (
      (record.reference || '')
        .toLowerCase()
        .includes(query) ||
      getProductName(record.product_id)
        .toLowerCase()
        .includes(query)
    );

    const matchesProduct = !filters.productId || record.product_id === Number(filters.productId);
    const matchesLocation = !filters.locationId || record.location_id === Number(filters.locationId);
    const matchesPurpose = !filters.purpose || record.purpose === filters.purpose;

    const recordDate = new Date(record.created_at);
    const matchesMinDate = !filters.minDate || recordDate >= new Date(filters.minDate);
    const matchesMaxDate = !filters.maxDate || recordDate <= new Date(filters.maxDate);

    return matchesSearch && matchesProduct && matchesLocation && matchesPurpose && matchesMinDate && matchesMaxDate;
  });

  const handleViewStockOut = async (id) => {
    try {
      const response = await apiGet(`/stock/out/${id}`, token);
      setViewingStockOut(response.data || response);
      viewModal.open();
    } catch (err) {
      setError(`Failed to load stock-out details: ${err.message}`);
    }
  };

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Operations</div>
            <h3 className="panel-title">Stock Issue (Stock Out)</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <input
                type="search"
                className="text-input"
                placeholder="Search issuances..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="toolbar-group">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setAllocationResult(null);
                  setError('');
                  modal.open();
                }}
              >
                + Issue Stock (FIFO)
              </button>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="panel filter-panel">
        <div className="filter-section">
          <h4 className="filter-title">Filters</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Product</label>
              <select 
                className="text-input filter-select" 
                value={filters.productId} 
                onChange={(e) => setFilters({...filters, productId: e.target.value})}
              >
                <option value="">All Products</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <select 
                className="text-input filter-select" 
                value={filters.locationId} 
                onChange={(e) => setFilters({...filters, locationId: e.target.value})}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Purpose</label>
              <select 
                className="text-input filter-select" 
                value={filters.purpose} 
                onChange={(e) => setFilters({...filters, purpose: e.target.value})}
              >
                <option value="">All Purposes</option>
                <option value="sale">Sale</option>
                <option value="damage">Damage</option>
                <option value="loss">Loss</option>
                <option value="return">Return</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
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
                onClick={() => setFilters({
                  productId: '', locationId: '', purpose: '', minDate: '', maxDate: ''
                })}
              >
                Clear Filters
              </button>
              <span className="filter-result">
                {filteredRecords.length} of {stockOutRecords.length} records
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
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Cost (FIFO)</th>
              <th>Purpose</th>
              <th>Issued By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.reference}</td>
                <td>{record.product || 'Unknown'}</td>
                <td>{getLocationName(record.location_id)}</td>
                <td>{record.quantity}</td>
                <td>TZS {Number(record.cost_fifo || record.total_cost || 0).toLocaleString()}</td>
                <td>{record.purpose}</td>
                <td>{record.issued_by || 'System'}</td>
                <td>
                  {record.issued_at ? new Date(record.issued_at).toLocaleDateString() : new Date(record.created_at).toLocaleDateString()}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleViewStockOut(record.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Stock Out Modal */}
      <Modal
        isOpen={modal.isOpen}
        title="Issue Stock (FIFO Allocation)"
        onClose={() => {
          modal.close();
          setForm(initialForm);
          setAllocationResult(null);
          setError('');
        }}
        size="large"
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Product *</label>
            <select
              className="text-input"
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
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
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Quantity *</label>
            <input
              className="text-input"
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Purpose</label>
            <select
              className="text-input"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
            >
              <option value="sale">Sale</option>
              <option value="transfer">Transfer</option>
              <option value="sample">Sample</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Reference #</label>
            <input
              className="text-input"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder="Invoice/Order #"
            />
          </div>

          <div className="field-group full-width">
            <label className="field-label">Allocation Mode</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="allocationMode"
                  value="automatic"
                  checked={form.allocationMode === 'automatic'}
                  onChange={handleChange}
                />
                Automatic (FIFO) - Oldest batches first
              </label>
              <label>
                <input
                  type="radio"
                  name="allocationMode"
                  value="manual"
                  checked={form.allocationMode === 'manual'}
                  onChange={handleChange}
                />
                Manual - Select specific batches
              </label>
            </div>
          </div>

          {batches.length === 0 && form.productId && form.locationId && (
            <div className="alert alert-warning full-width">
              No batches available for this product at this location
            </div>
          )}

          {form.allocationMode === 'automatic' && batches.length > 0 && (
            <>
              <div className="full-width section-divider"></div>
              <button
                type="button"
                className="btn btn-info full-width"
                onClick={calculateFIFOAllocation}
              >
                Calculate FIFO Allocation
              </button>
            </>
          )}

          {form.allocationMode === 'manual' && batches.length > 0 && (
            <>
              <div className="full-width">
                <h4>Available Batches (FIFO Order)</h4>
                <div className="batch-selection-table">
                  {batches.map((batch, idx) => {
                    const selectedBatch = form.selectedBatches.find(
                      (b) => b.batchId === batch.id
                    );
                    return (
                      <div key={batch.id} className="batch-item">
                        <div className="batch-info">
                          <div>
                            <strong>Batch {idx + 1}:</strong> {batch.batch_number}
                          </div>
                          <div>Received: {new Date(batch.received_at).toLocaleDateString()}</div>
                          <div>
                            Available: {batch.quantity_remaining} units @ TZS{' '}
                            {Number(batch.unit_selling_price ?? batch.unit_cost ?? 0).toLocaleString()}/unit
                          </div>
                          <div>Condition: {batch.condition}</div>
                        </div>
                        <div className="batch-select">
                          <input
                            type="number"
                            placeholder="Qty to take"
                            min="0"
                            max={batch.quantity_remaining}
                            value={selectedBatch?.quantity || 0}
                            onChange={(e) =>
                              handleManualBatchSelect(
                                batch.id,
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* FIFO Allocation Result */}
          {allocationResult && (
            <>
              <div className="full-width section-divider"></div>
              <div className="full-width">
                <h4>FIFO Allocation Summary</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Batch #</th>
                      <th>Received</th>
                      <th>Condition</th>
                      <th>Qty</th>
                      <th>Unit Selling Price</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationResult.allocation.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.batchNumber}</td>
                        <td>
                          {new Date(item.receivedAt).toLocaleDateString()}
                        </td>
                        <td>{item.condition}</td>
                        <td>{item.quantity}</td>
                        <td>TZS {Number(item.unitCost).toLocaleString()}</td>
                        <td>
                          TZS{' '}
                          {Number(item.totalCost).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="info-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '16px 20px',
                    marginTop: '18px',
                  }}
                >
                  <div className="info-item">
                    <label>Total Allocated</label>
                    <div className="font-large font-weight-bold">
                      {allocationResult.totalQtyAllocated} units
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Total Value (FIFO)</label>
                    <div className="font-large font-weight-bold">
                      TZS{' '}
                      {Number(
                        allocationResult.totalCost
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-actions full-width">
            {allocationResult && (
              <button type="submit" className="btn btn-primary">
                Confirm And Issue Stock
              </button>
            )}
            {form.allocationMode === 'manual' &&
              form.selectedBatches.length > 0 && (
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Issue Selected Batches
                </button>
              )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                modal.close();
                setForm(initialForm);
                setAllocationResult(null);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* View Stock Out Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        title="View Stock Out Record"
        onClose={() => {
          viewModal.close();
          setViewingStockOut(null);
        }}
        size="large"
      >
        {viewingStockOut && (
          <div>
            <h4>Reference: {viewingStockOut.reference}</h4>
            <p>Product: {getProductName(viewingStockOut.product_id)}</p>
            <p>Location: {getLocationName(viewingStockOut.location_id)}</p>
            <p>Quantity: {viewingStockOut.quantity}</p>
            <p>Cost: TZS {Number(viewingStockOut.total_cost || 0).toLocaleString()}</p>
            <p>Purpose: {viewingStockOut.purpose}</p>
            <p>Issued By: {viewingStockOut.issuer?.fullName || viewingStockOut.issued_by || 'System'}</p>
            <p>Date: {new Date(viewingStockOut.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StockOutPage;

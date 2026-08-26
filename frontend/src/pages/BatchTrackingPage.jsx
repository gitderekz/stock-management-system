import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';

const BatchTrackingPage = () => {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    minQuantity: '',
    maxQuantity: '',
    sortBy: 'received_date_asc',
  });

  const loadBatches = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/stock/batches', token);
      setBatches(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [token]);

  const calculateBatchAge = (receivedDate) => {
    const received = new Date(receivedDate);
    const now = new Date();
    const days = Math.floor((now - received) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getAgeStatus = (age) => {
    if (age < 7) return { label: 'Fresh', className: 'badge-success' };
    if (age < 30) return { label: 'Active', className: 'badge-info' };
    if (age < 90) return { label: 'Aging', className: 'badge-warning' };
    return { label: 'Aged', className: 'badge-danger' };
  };

  const filteredAndSortedBatches = useMemo(() => {
    let result = batches.map((batch) => ({
      ...batch,
      age: calculateBatchAge(batch.received_at),
      total_landed_cost: (batch.landed_cost || 0) * (batch.quantity_received || 0),
    }));

    // Apply search filter
    const query = search.toLowerCase();
    if (query) {
      result = result.filter((batch) =>
        (batch.batch_number || '').toLowerCase().includes(query) ||
        (batch.product || '').toLowerCase().includes(query) ||
        (batch.location || '').toLowerCase().includes(query) ||
        (batch.po_number || '').toLowerCase().includes(query)
      );
    }

    // Apply age filters
    if (filters.minAge) {
      result = result.filter((batch) => (batch.age || 0) >= Number(filters.minAge));
    }
    if (filters.maxAge) {
      result = result.filter((batch) => (batch.age || 0) <= Number(filters.maxAge));
    }

    // Apply quantity filters
    if (filters.minQuantity) {
      result = result.filter((batch) => (batch.quantity_remaining || 0) >= Number(filters.minQuantity));
    }
    if (filters.maxQuantity) {
      result = result.filter((batch) => (batch.quantity_remaining || 0) <= Number(filters.maxQuantity));
    }

    // Apply sorting
    const sorted = [...result];
    switch (filters.sortBy) {
      case 'received_date_asc':
        sorted.sort((a, b) => new Date(a.received_at) - new Date(b.received_at));
        break;
      case 'received_date_desc':
        sorted.sort((a, b) => new Date(b.received_at) - new Date(a.received_at));
        break;
      case 'age_asc':
        sorted.sort((a, b) => a.age - b.age);
        break;
      case 'age_desc':
        sorted.sort((a, b) => b.age - a.age);
        break;
      case 'quantity_asc':
        sorted.sort((a, b) => (a.quantity_remaining || 0) - (b.quantity_remaining || 0));
        break;
      case 'quantity_desc':
        sorted.sort((a, b) => (b.quantity_remaining || 0) - (a.quantity_remaining || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [batches, search, filters]);

  const usePaginatedRows = (rows, pageSize = 10) => {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [rows?.length]);
    const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const visibleRows = rows?.slice(startIndex, startIndex + pageSize) || [];
    return { page: safePage, setPage, totalPages, visibleRows };
  };

  const paginated = usePaginatedRows(filteredAndSortedBatches, 10);
  const { page: batchPage, setPage: setBatchPage, totalPages: batchTotal, visibleRows: visibleBatches } = paginated;

  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      minQuantity: '',
      maxQuantity: '',
      sortBy: 'received_date_asc',
    });
    setSearch('');
  };

  const stats = useMemo(() => {
    const totalBatches = batches.length;
    const totalQuantity = batches.reduce((sum, batch) => sum + (batch.quantity_remaining || 0), 0);
    const totalValue = batches.reduce((sum, batch) => sum + ((batch.unit_cost || 0) * (batch.quantity_remaining || 0)), 0);
    const averageAge = batches.length > 0 
      ? Math.round(batches.reduce((sum, batch) => sum + calculateBatchAge(batch.received_at), 0) / batches.length)
      : 0;

    return { totalBatches, totalQuantity, totalValue, averageAge };
  }, [batches]);

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Stock Management</div>
            <h3 className="panel-title">Batch Tracking</h3>
          </div>
          <div className="toolbar-actions">
            <input
              type="search"
              className="text-input"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-light" onClick={loadBatches}>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="panel stats-panel">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalBatches}</div>
            <div className="stat-label">Total Batches</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalQuantity.toLocaleString()}</div>
            <div className="stat-label">Total Quantity</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">TZS {(stats.totalValue / 1000000).toFixed(2)}M</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageAge} days</div>
            <div className="stat-label">Average Age</div>
          </div>
        </div>
      </section>

      <section className="panel filter-panel">
        <div className="filter-section">
          <h4 className="filter-title">Filters & Sort</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Age (Min Days)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Min age" 
                value={filters.minAge}
                onChange={(e) => setFilters({...filters, minAge: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Age (Max Days)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Max age" 
                value={filters.maxAge}
                onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Quantity (Min)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Min qty" 
                value={filters.minQuantity}
                onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Quantity (Max)</label>
              <input 
                type="number" 
                className="text-input" 
                placeholder="Max qty" 
                value={filters.maxQuantity}
                onChange={(e) => setFilters({...filters, maxQuantity: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select 
                className="text-input" 
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="received_date_asc">Oldest First (FIFO)</option>
                <option value="received_date_desc">Newest First</option>
                <option value="age_asc">Age ↑</option>
                <option value="age_desc">Age ↓</option>
                <option value="quantity_asc">Quantity ↑</option>
                <option value="quantity_desc">Quantity ↓</option>
              </select>
            </div>
            <div className="filter-group button-group">
              <button 
                className="btn btn-ghost" 
                onClick={clearFilters}
              >
                Clear Filters
              </button>
              <span className="filter-result">
                {filteredAndSortedBatches.length} of {batches.length} batches
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel table-panel">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading batches...</div>
        ) : filteredAndSortedBatches.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-soft)' }}>
            No batches found.
          </div>
        ) : (
            <>
          <table className="table">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Product</th>
                <th>Location</th>
                <th>Qty Received</th>
                <th>Qty Remaining</th>
                <th>Unit Cost</th>
                <th>Unit Selling</th>
                <th>Landed Cost</th>
                <th>Total Landed</th>
                <th>Received</th>
                <th>Age</th>
                <th>FIFO</th>
              </tr>
            </thead>
            <tbody>
              {visibleBatches.map((batch, index) => {
                const ageStatus = getAgeStatus(batch.age);
                const totalLandedCost = (batch.landed_cost || 0) * (batch.quantity_received || 0);
                return (
                  <tr key={batch.id}>
                    <td className="font-weight-bold">{batch.batch_number}</td>
                    <td>{batch.product || 'Unknown'}</td>
                    <td>{batch.location || 'Unknown'}</td>
                    <td>{(batch.quantity_received || 0).toLocaleString()}</td>
                    <td><strong>{(batch.quantity_remaining || 0).toLocaleString()}</strong></td>
                    <td>TZS {(batch.unit_cost || 0).toLocaleString()}</td>
                    <td>TZS {(batch.unit_selling_price || 0).toLocaleString()}</td>
                    <td>TZS {(batch.landed_cost || 0).toLocaleString()}</td>
                    <td>TZS {totalLandedCost.toLocaleString()}</td>
                    <td>{new Date(batch.received_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ageStatus.className}`}>
                        {batch.age}d
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {index + 1}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedBatches.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
              <button className="btn btn-light" onClick={() => setBatchPage((p) => Math.max(1, p - 1))} disabled={batchPage === 1}>Prev</button>
              <span style={{ fontSize: 12, color: '#475569' }}>Page {batchPage}/{batchTotal}</span>
              <button className="btn btn-light" onClick={() => setBatchPage((p) => Math.min(batchTotal, p + 1))} disabled={batchPage >= batchTotal}>Next</button>
            </div>
          )}
            </>
        )}
      </section>
    </div>
  );
};

export default BatchTrackingPage;

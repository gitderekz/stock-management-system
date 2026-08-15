import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';

const currency = (value) => `TZS ${Number(value || 0).toLocaleString()}`;
const asRows = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

const ReportsPage = () => {
  const { token } = useAuth();
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadReport = async (reportType) => {
    setLoading(true);
    setError('');
    try {
      let response;
      const params = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

      switch (reportType) {
        case 'overview':
          response = await apiGet('/reports', token);
          break;
        case 'valuation':
          response = await apiGet(`/reports/valuation${params}`, token);
          break;
        case 'fifo-cost':
          response = await apiGet(`/reports/fifo-cost${params}`, token);
          break;
        case 'low-stock':
          response = await apiGet(`/reports/low-stock${params}`, token);
          break;
        case 'movements':
          response = await apiGet(`/reports/movements-summary${params}`, token);
          break;
        case 'audit':
          response = await apiGet(`/reports/audit-trail${params}`, token);
          break;
        default:
          response = await apiGet('/reports', token);
      }

      const payload = response?.data ?? response ?? {};
      setData(payload);
    } catch (err) {
      setError(err.message || 'Unable to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport, dateRange.startDate, dateRange.endDate]);

  const overview = data?.inventory || data || {};
  const movements = data?.movements || {};
  const purchases = data?.purchases || {};

  const renderTotalsRow = (columns, totals) => (
    <tr style={{ fontWeight: 700, background: 'rgba(15, 23, 42, 0.06)' }}>
      {columns.map((col) => (
        <td key={col.key}>{totals[col.key] ?? ''}</td>
      ))}
    </tr>
  );

  const OverviewReport = () => (
    <div className="report-grid">
      <div className="report-card">
        <div className="report-title">Total Products</div>
        <div className="report-value">{overview.totalProducts || 0}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Stock Value</div>
        <div className="report-value">{currency(overview.totalStockValue || 0)}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Low Stock</div>
        <div className="report-value" style={{ color: '#f59e0b' }}>{overview.lowStock || 0}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Out of Stock</div>
        <div className="report-value" style={{ color: '#ef4444' }}>{overview.outOfStock || 0}</div>
      </div>

      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h4>Today's Activity</h4>
        <div className="info-grid">
          <div className="info-item">
            <label>Stock In</label>
            <div className="text-success">{movements.stockInToday || 0} units</div>
          </div>
          <div className="info-item">
            <label>Stock Out</label>
            <div className="text-danger">{movements.stockOutToday || 0} units</div>
          </div>
          <div className="info-item">
            <label>Transfers</label>
            <div className="text-info">{movements.transfersToday || 0}</div>
          </div>
          <div className="info-item">
            <label>Damaged</label>
            <div className="text-danger">{movements.damagedToday || 0}</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h4>Purchases by Supplier</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {(purchases.purchaseBySupplier || []).map((supplier, idx) => (
              <tr key={idx}>
                <td>{supplier.supplier}</td>
                <td>{currency(supplier.value)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, background: 'rgba(15, 23, 42, 0.06)' }}>
              <td>Total</td>
              <td>{currency(purchases.totalPurchases || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const ValuationReport = () => {
    const rows = asRows(data?.data || data?.valuations || []);
    const columns = [
      { key: 'product', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'location', label: 'Location' },
      { key: 'quantity', label: 'Qty' },
      { key: 'unit_cost', label: 'Unit Cost' },
      { key: 'total_cost', label: 'Total Value' },
    ];
    const totals = {
      product: 'TOTAL',
      quantity: rows.reduce((sum, row) => sum + Number(row.quantity || row.qty || 0), 0),
      total_cost: rows.reduce((sum, row) => sum + Number(row.total_cost || row.totalValue || 0), 0),
    };

    return (
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.product_name || row.productName || row.product || '—'}</td>
                <td>{row.sku || row.productSku || '—'}</td>
                <td>{row.location || row.location_name || '—'}</td>
                <td>{Number(row.quantity || row.qty || 0)}</td>
                <td>{currency(row.unit_cost || row.unitCost || 0)}</td>
                <td>{currency(row.total_cost || row.totalValue || 0)}</td>
              </tr>
            ))}
            {renderTotalsRow(columns, totals)}
          </tbody>
        </table>
      </div>
    );
  };

  const LowStockReport = () => {
    const rows = asRows(data?.data || data?.lowStockProducts || []);
    const columns = [
      { key: 'product', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'recorded_quantity', label: 'Current Qty' },
      { key: 'reorder_level', label: 'Reorder' },
      { key: 'actual_remaining', label: 'Actual Remaining' },
      { key: 'alert_level', label: 'Alert' },
    ];
    const totals = {
      product: 'TOTAL',
      recorded_quantity: rows.reduce((sum, row) => sum + Number(row.recorded_quantity || row.currentStock || 0), 0),
      reorder_level: rows.reduce((sum, row) => sum + Number(row.reorder_level || row.reorderLevel || 0), 0),
      actual_remaining: rows.reduce((sum, row) => sum + Number(row.actual_remaining || row.actualRemaining || 0), 0),
    };

    return (
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.product_name || row.productName || row.product || '—'}</td>
                <td>{row.sku || '—'}</td>
                <td>{Number(row.recorded_quantity || row.currentStock || 0)}</td>
                <td>{Number(row.reorder_level || row.reorderLevel || 0)}</td>
                <td>{Number(row.actual_remaining || row.actualRemaining || 0)}</td>
                <td><span className="badge badge-warning">{row.alert_level || row.alertLevel || 'LOW'}</span></td>
              </tr>
            ))}
            {renderTotalsRow(columns, totals)}
          </tbody>
        </table>
      </div>
    );
  };

  const MovementsReport = () => {
    const rows = asRows(data?.data || []);
    const columns = [
      { key: 'type', label: 'Type' },
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Qty' },
      { key: 'from_location', label: 'From' },
      { key: 'to_location', label: 'To' },
      { key: 'value', label: 'Value' },
    ];
    const totals = {
      type: 'TOTAL',
      quantity: rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
      value: rows.reduce((sum, row) => sum + Number(row.value || row.total_cost || 0), 0),
    };

    return (
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.type}</td>
                <td>{row.product || row.product_name || '—'}</td>
                <td>{Number(row.quantity || 0)}</td>
                <td>{row.from_location || '—'}</td>
                <td>{row.to_location || '—'}</td>
                <td>{currency(row.value || row.total_cost || 0)}</td>
              </tr>
            ))}
            {renderTotalsRow(columns, totals)}
          </tbody>
        </table>
      </div>
    );
  };

  const FIFOCostReport = () => {
    const rows = asRows(data?.data || []);
    const columns = [
      { key: 'product', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity_issued', label: 'Qty Issued' },
      { key: 'unit_cost', label: 'Unit Cost' },
      { key: 'total_cost', label: 'COGS' },
      { key: 'issued_by', label: 'Issued By' },
    ];
    const totals = {
      product: 'TOTAL',
      quantity_issued: rows.reduce((sum, row) => sum + Number(row.quantity_issued || row.quantity || 0), 0),
      total_cost: rows.reduce((sum, row) => sum + Number(row.total_cost || row.totalCost || 0), 0),
    };

    return (
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.product_name || row.product || '—'}</td>
                <td>{row.sku || '—'}</td>
                <td>{Number(row.quantity_issued || row.quantity || 0)}</td>
                <td>{currency(row.unit_cost || row.unitCost || 0)}</td>
                <td>{currency(row.total_cost || row.totalCost || 0)}</td>
                <td>{row.issued_by || row.issuedBy || 'System'}</td>
              </tr>
            ))}
            {renderTotalsRow(columns, totals)}
          </tbody>
        </table>
      </div>
    );
  };

  const AuditReport = () => {
    const rows = asRows(data?.data || data?.auditLogs || []);
    const columns = [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'user', label: 'User' },
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
    ];
    const totals = { user: 'TOTAL', action: rows.length, entity: '' };

    return (
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => <th key={col.key}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((log, idx) => (
              <tr key={idx}>
                <td>{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                <td>{log.user || log.user_name || 'System'}</td>
                <td>{log.action}</td>
                <td>{log.entity || log.entityType || '—'}</td>
              </tr>
            ))}
            {renderTotalsRow(columns, totals)}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="content-space">
      <section className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Analytics</div>
            <h3 className="panel-title">Reports & Analytics</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <label className="field-label">Start Date:</label>
              <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} />
              <label className="field-label">End Date:</label>
              <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} />
            </div>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="panel">
        <div className="tabs-header">
          <button className={`tab-button ${activeReport === 'overview' ? 'active' : ''}`} onClick={() => setActiveReport('overview')}>Overview</button>
          <button className={`tab-button ${activeReport === 'valuation' ? 'active' : ''}`} onClick={() => setActiveReport('valuation')}>Valuation</button>
          <button className={`tab-button ${activeReport === 'fifo-cost' ? 'active' : ''}`} onClick={() => setActiveReport('fifo-cost')}>FIFO Cost</button>
          <button className={`tab-button ${activeReport === 'low-stock' ? 'active' : ''}`} onClick={() => setActiveReport('low-stock')}>Low Stock</button>
          <button className={`tab-button ${activeReport === 'movements' ? 'active' : ''}`} onClick={() => setActiveReport('movements')}>Movements</button>
          <button className={`tab-button ${activeReport === 'audit' ? 'active' : ''}`} onClick={() => setActiveReport('audit')}>Audit</button>
        </div>

        <div className="tabs-content">
          {loading && <div className="alert alert-info">Loading report data...</div>}
          {!loading && activeReport === 'overview' && <OverviewReport />}
          {!loading && activeReport === 'valuation' && <ValuationReport />}
          {!loading && activeReport === 'fifo-cost' && <FIFOCostReport />}
          {!loading && activeReport === 'low-stock' && <LowStockReport />}
          {!loading && activeReport === 'movements' && <MovementsReport />}
          {!loading && activeReport === 'audit' && <AuditReport />}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;

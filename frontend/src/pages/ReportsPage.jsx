import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/export.js';

const currency = (value) => `TZS ${Number(value || 0).toLocaleString()}`;

const normalizeKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const asRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.records)) return payload.records;
  if (payload && typeof payload === 'object') {
    const nested = Object.values(payload).find((value) => Array.isArray(value));
    return nested || [];
  }
  return [];
};

const resolveReportRows = (response, extraKeys = []) => {
  if (!response) return [];

  const queue = [response];
  const seen = new Set();
  const rows = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    const id = typeof current === 'object' ? JSON.stringify(current) : String(current);
    if (seen.has(id)) continue;
    seen.add(id);

    if (Array.isArray(current)) {
      rows.push(...current.filter((item) => item && typeof item === 'object'));
      continue;
    }

    if (Array.isArray(current.data)) rows.push(...current.data);
    if (Array.isArray(current.rows)) rows.push(...current.rows);
    if (Array.isArray(current.items)) rows.push(...current.items);
    if (Array.isArray(current.records)) rows.push(...current.records);

    for (const key of extraKeys) {
      if (Array.isArray(current[key])) rows.push(...current[key]);
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) queue.push(value);
    });
  }

  return rows.length ? rows : asRows(response);
};

const getTableRows = (response, extraKeys = []) => {
  const rows = resolveReportRows(response, extraKeys);
  if (rows.length) return rows;

  if (response && typeof response === 'object') {
    const directArray = Object.values(response).filter(Array.isArray).flatMap((value) => value);
    if (directArray.length) return directArray;
  }

  return [];
};

const getNestedValue = (row, key) => {
  if (!row || !key) return '—';

  if (key.includes('.')) {
    const value = key.split('.').reduce((acc, segment) => acc?.[segment], row);
    if (value !== undefined && value !== null && value !== '') return value;
  }

  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];

  const directMatch = Object.keys(row).find((rowKey) => normalizeKey(rowKey) === normalizeKey(key));
  if (directMatch) return row[directMatch];

  const partialMatch = Object.keys(row).find((rowKey) =>
    normalizeKey(rowKey).includes(normalizeKey(key)) || normalizeKey(key).includes(normalizeKey(rowKey))
  );
  if (partialMatch) return row[partialMatch];

  return '—';
};

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.length ? value.map((item) => formatCellValue(item)).join(', ') : '—';
    if (value.name) return value.name;
    if (value.fullName) return value.fullName;
    if (value.label) return value.label;
    if (value.po_number) return value.po_number;
    if (value.email) return value.email;
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value.toLocaleString();
    return String(value);
  }
  return String(value);
};

const getReportRowsForTab = (activeReport, payload) => {
  switch (activeReport) {
    case 'overview':
      return getTableRows(payload?.data || payload || [], ['inventory', 'movements', 'purchases', 'stockSegments']);
    case 'valuation':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'fifo-cost':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'low-stock':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'movements':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'audit':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'purchase-orders':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'stock-in':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'stock-out':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'transfers':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'damaged':
      return getTableRows(payload?.data || payload || [], ['data']);
    case 'returns':
      return getTableRows(payload?.data || payload || [], ['data']);
    default:
      return getTableRows(payload || []);
  }
};

const reportTableStyle = {
  borderCollapse: 'separate',
  borderSpacing: 0,
  width: '100%',
  fontSize: '0.92rem',
  background: 'rgba(15, 23, 42, 0.015)',
  borderRadius: '16px',
  overflow: 'hidden',
};

const reportHeaderStyle = {
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96))',
  color: '#f8fafc',
  fontWeight: 700,
  letterSpacing: '0.02em',
  borderBottom: '1px solid rgba(148, 163, 184, 0.28)',
  padding: '12px 14px',
  textAlign: 'left',
};

const reportCellStyle = {
  padding: '11px 14px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
  verticalAlign: 'middle',
  background: '#fff',
};

const reportTotalsStyle = {
  background: 'rgba(37, 99, 235, 0.04)',
  fontWeight: 700,
  color: '#0f172a',
};

const reports = [
  'overview',
  'valuation',
  'fifo-cost',
  'low-stock',
  'movements',
  'audit',
  'purchase-orders',
  'stock-in',
  'stock-out',
  'transfers',
  'damaged',
  'returns',
];

const reportLabels = {
  overview: 'Overview',
  valuation: 'Valuation',
  'fifo-cost': 'FIFO Cost',
  'low-stock': 'Low Stock',
  movements: 'Movements',
  audit: 'Audit',
  'purchase-orders': 'Purchase Orders',
  'stock-in': 'Stock In',
  'stock-out': 'Stock Out',
  transfers: 'Transfers',
  damaged: 'Damaged',
  returns: 'Returns',
};

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
        case 'purchase-orders':
          response = await apiGet(`/reports/purchase-orders${params}`, token);
          break;
        case 'stock-in':
          response = await apiGet('/stock/in', token);
          break;
        case 'stock-out':
          response = await apiGet('/stock/out', token);
          break;
        case 'transfers':
          response = await apiGet('/stock/transfer', token);
          break;
        case 'damaged':
          response = await apiGet('/stock/damage', token);
          break;
        case 'returns':
          response = await apiGet('/stock/return', token);
          break;
        default:
          response = await apiGet('/reports', token);
      }

      setData(response ?? {});
    } catch (err) {
      setError(err.message || 'Unable to load report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport, dateRange.startDate, dateRange.endDate]);

  const payload = data?.data ?? data ?? {};
  const overview = data?.inventory ?? data?.data?.inventory ?? (payload ?? {});
  const movements = data?.movements ?? data?.data?.movements ?? {};
  const purchases = data?.purchases ?? data?.data?.purchases ?? {};
  const stockSegments = data?.stockSegments ?? data?.data?.stockSegments ?? [
    { name: 'Available', value: overview.totalProducts || 0 },
    { name: 'Low Stock', value: overview.lowStock || 0 },
    { name: 'Damaged', value: overview.damaged || 0 },
    { name: 'Reserved', value: 0 },
  ];

  const getCurrentRows = () => {
    if (!data) return [];
    const payload = data?.data ?? data ?? {};
    return getReportRowsForTab(activeReport, payload);
  };

  const exportCurrentReport = (type) => {
    const rows = getCurrentRows();
    if (!rows.length) {
      alert('No data to export for this report.');
      return;
    }

    const filename = `${activeReport || 'report'}-${new Date().toISOString().slice(0, 10)}.${type === 'csv' ? 'csv' : type === 'xls' ? 'xlsx' : 'pdf'}`;
    if (type === 'csv') exportToCSV(rows, filename);
    if (type === 'xls') exportToExcel(rows, filename);
    if (type === 'pdf') exportToPDF(rows, filename);
  };

  const GenericReport = ({ title, columns, rows, totals }) => (
    <div className="panel" style={{ padding: 0, borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, padding: '16px 18px 14px', background: 'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(241,245,249,0.85))', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{title}</h4>
        <div className="toolbar-group">
          <button className="btn btn-light" type="button" onClick={() => exportCurrentReport('csv')}>CSV</button>
          <button className="btn btn-light" type="button" onClick={() => exportCurrentReport('xls')}>Excel</button>
          <button className="btn btn-light" type="button" onClick={() => exportCurrentReport('pdf')}>PDF</button>
        </div>
      </div>

      {(!rows || rows.length === 0) ? (
        <div className="alert alert-info" style={{ margin: 18 }}>No data available for this report.</div>
      ) : (
        <div style={{ overflowX: 'auto', padding: 14 }}>
          <table className="table" style={reportTableStyle}>
            <thead>
              <tr>
                {columns.map((col) => <th key={col.key} style={reportHeaderStyle}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  {columns.map((col) => (
                    <td key={`${idx}-${col.key}`} style={reportCellStyle}>
                      {formatCellValue(getNestedValue(row, col.key))}
                    </td>
                  ))}
                </tr>
              ))}
              {totals && (
                <tr style={reportTotalsStyle}>
                  {columns.map((col) => (
                    <td key={`totals-${col.key}`} style={{ ...reportCellStyle, borderBottom: 'none' }}>{formatCellValue(getNestedValue(totals, col.key))}</td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0 }}>Inventory Health - Stock Distribution</h4>
        </div>
        <div className="chart-area">
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            <div style={{ width: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: '#64748b', paddingBottom: 18 }}>
              {[4, 3, 2, 1, 0].map((tick) => (
                <div key={tick} style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{tick}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ position: 'relative', height: 220, borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'end', gap: 14, padding: '8px 8px 0 8px' }}>
                {stockSegments.map((segment, idx) => {
                  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8'];
                  const max = Math.max(...stockSegments.map((s) => Number(s.value || 0)), 1);
                  const value = Number(segment.value || 0);
                  const height = `${(value / max) * 100}%`;
                  return (
                    <div key={idx} style={{ flex: 1, minWidth: 80, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }} title={`${segment.name}: ${segment.value} items`}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', paddingBottom: 6 }}>
                        <div style={{ width: '80%', height, minHeight: 18, background: colors[idx % colors.length], borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, boxShadow: '0 8px 18px rgba(15, 23, 42, 0.12)' }}>{value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10, fontSize: 12, color: '#334155', fontWeight: 600 }}>
                {stockSegments.map((segment, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center' }}>{segment.name}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h4 style={{ marginBottom: 12 }}>Today's Activity</h4>
        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div className="info-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
            <label style={{ color: '#64748b', fontWeight: 600 }}>Stock In</label>
            <div className="text-success" style={{ fontWeight: 700, fontSize: 20, color: '#16a34a' }}>{movements.stockInToday || 0} units</div>
          </div>
          <div className="info-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
            <label style={{ color: '#64748b', fontWeight: 600 }}>Stock Out</label>
            <div className="text-danger" style={{ fontWeight: 700, fontSize: 20, color: '#dc2626' }}>{movements.stockOutToday || 0} units</div>
          </div>
          <div className="info-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
            <label style={{ color: '#64748b', fontWeight: 600 }}>Transfers</label>
            <div className="text-info" style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>{movements.transfersToday || 0}</div>
          </div>
          <div className="info-item" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
            <label style={{ color: '#64748b', fontWeight: 600 }}>Damaged</label>
            <div className="text-danger" style={{ fontWeight: 700, fontSize: 20, color: '#dc2626' }}>{movements.damagedToday || 0}</div>
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
    const rows = getTableRows(data?.data || data?.valuations || []);
    const columns = [
      { key: 'product_name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'location', label: 'Location' },
      { key: 'quantity', label: 'Qty' },
      { key: 'unit_cost', label: 'Unit Cost' },
      { key: 'total_cost', label: 'Total Value' },
    ];
    const totals = {
      product_name: 'TOTAL',
      quantity: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
      total_cost: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'total_cost') || 0), 0),
    };
    return <GenericReport title="Stock Valuation" columns={columns} rows={rows.map((row) => ({ ...row, unit_cost: Number(getNestedValue(row, 'unit_cost') || 0), total_cost: Number(getNestedValue(row, 'total_cost') || 0) }))} totals={totals} />;
  };

  const LowStockReport = () => {
    const rows = getTableRows(data?.data || data?.lowStockProducts || []);
    const columns = [
      { key: 'product_name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'recorded_quantity', label: 'Current Qty' },
      { key: 'reorder_level', label: 'Reorder' },
      { key: 'actual_remaining', label: 'Actual Remaining' },
      { key: 'alert_level', label: 'Alert' },
    ];
    const totals = {
      product_name: 'TOTAL',
      recorded_quantity: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'recorded_quantity') || 0), 0),
      reorder_level: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'reorder_level') || 0), 0),
      actual_remaining: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'actual_remaining') || 0), 0),
    };
    return <GenericReport title="Low Stock Alerts" columns={columns} rows={rows} totals={totals} />;
  };

  const MovementsReport = () => {
    const rows = getTableRows(data?.data || []);
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
      quantity: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
      value: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'value') || 0), 0),
    };
    return <GenericReport title="Movement Summary" columns={columns} rows={rows.map((row) => ({ ...row, product: getNestedValue(row, 'product') || 'Unknown', value: Number(getNestedValue(row, 'value') || 0) }))} totals={totals} />;
  };

  const FIFOCostReport = () => {
    const rows = getTableRows(data?.data || []);
    const columns = [
      { key: 'product_name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity_issued', label: 'Qty Issued' },
      { key: 'unit_cost', label: 'Unit Cost' },
      { key: 'total_cost', label: 'COGS' },
      { key: 'issued_by', label: 'Issued By' },
    ];
    const totals = {
      product_name: 'TOTAL',
      quantity_issued: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity_issued') || 0), 0),
      total_cost: rows.reduce((sum, row) => sum + Number(getNestedValue(row, 'total_cost') || 0), 0),
    };
    return <GenericReport title="FIFO Cost" columns={columns} rows={rows.map((row) => ({ ...row, unit_cost: Number(getNestedValue(row, 'unit_cost') || 0), total_cost: Number(getNestedValue(row, 'total_cost') || 0) }))} totals={totals} />;
  };

  const AuditReport = () => {
    const rows = getTableRows(data?.data || data?.auditLogs || []);
    const columns = [
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'user', label: 'User' },
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
    ];
    const totals = { user: 'TOTAL', action: rows.length, entity: '' };
    return <GenericReport title="Audit Trail" columns={columns} rows={rows.map((row) => ({ ...row, timestamp: new Date(getNestedValue(row, 'timestamp') || row.createdAt || Date.now()).toLocaleString() }))} totals={totals} />;
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
              <input type="date" name="startDate" value={dateRange.startDate} onChange={(e) => setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }))} />
              <label className="field-label">End Date:</label>
              <input type="date" name="endDate" value={dateRange.endDate} onChange={(e) => setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }))} />
            </div>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="panel">
        <div className="tabs-header" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {reports.map((reportKey) => (
            <button key={reportKey} className={`tab-button ${activeReport === reportKey ? 'active' : ''}`} onClick={() => setActiveReport(reportKey)}>
              {reportLabels[reportKey]}
            </button>
          ))}
        </div>

        <div className="tabs-content">
          {loading && <div className="alert alert-info">Loading report data...</div>}
          {!loading && activeReport === 'overview' && <OverviewReport />}
          {!loading && activeReport === 'valuation' && <ValuationReport />}
          {!loading && activeReport === 'fifo-cost' && <FIFOCostReport />}
          {!loading && activeReport === 'low-stock' && <LowStockReport />}
          {!loading && activeReport === 'movements' && <MovementsReport />}
          {!loading && activeReport === 'audit' && <AuditReport />}
          {!loading && activeReport === 'purchase-orders' && (
            <GenericReport
              title="Purchase Orders"
              columns={[
                { key: 'po_number', label: 'PO No.' },
                { key: 'supplier.name', label: 'Supplier' },
                { key: 'po_status', label: 'Status' },
                { key: 'total_amount', label: 'Amount' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                po_number: getNestedValue(row, 'po_number') || getNestedValue(row, 'po_number') || getNestedValue(row, 'poNo') || '—',
                'supplier.name': getNestedValue(row, 'supplier.name') || getNestedValue(row, 'supplier') || '—',
                po_status: getNestedValue(row, 'po_status') || getNestedValue(row, 'status') || '—',
                total_amount: Number(getNestedValue(row, 'total_amount') || getNestedValue(row, 'totalAmount') || 0),
              }))}
              totals={{
                po_number: 'TOTAL',
                'supplier.name': '',
                po_status: '',
                total_amount: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'total_amount') || getNestedValue(row, 'totalAmount') || 0), 0),
              }}
            />
          )}
          {!loading && activeReport === 'stock-in' && (
            <GenericReport
              title="Stock In"
              columns={[
                { key: 'reference_number', label: 'Reference' },
                { key: 'supplier.name', label: 'Supplier' },
                { key: 'items_count', label: 'Items' },
                { key: 'total_cost', label: 'Value' },
                { key: 'status', label: 'Status' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                reference_number: getNestedValue(row, 'reference_number') || getNestedValue(row, 'referenceNo') || getNestedValue(row, 'reference_no') || '—',
                'supplier.name': getNestedValue(row, 'supplier.name') || getNestedValue(row, 'supplier') || '—',
                items_count: Number(getNestedValue(row, 'items_count') || 0),
                total_cost: Number(getNestedValue(row, 'total_cost') || 0),
                status: getNestedValue(row, 'status') || '—',
              }))}
              totals={{
                reference_number: 'TOTAL',
                'supplier.name': '',
                items_count: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'items_count') || 0), 0),
                total_cost: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'total_cost') || 0), 0),
                status: '',
              }}
            />
          )}
          {!loading && activeReport === 'stock-out' && (
            <GenericReport
              title="Stock Out"
              columns={[
                { key: 'reference', label: 'Reference' },
                { key: 'product.name', label: 'Product' },
                { key: 'quantity', label: 'Qty' },
                { key: 'cost_fifo', label: 'Cost' },
                { key: 'issued_by', label: 'Issued By' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                reference: getNestedValue(row, 'reference') || getNestedValue(row, 'referenceNo') || '—',
                'product.name': getNestedValue(row, 'product.name') || getNestedValue(row, 'product') || '—',
                quantity: Number(getNestedValue(row, 'quantity') || 0),
                cost_fifo: Number(getNestedValue(row, 'cost_fifo') || getNestedValue(row, 'total_cost') || 0),
                issued_by: getNestedValue(row, 'issued_by') || getNestedValue(row, 'created_by') || '—',
              }))}
              totals={{
                reference: 'TOTAL',
                'product.name': '',
                quantity: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
                cost_fifo: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'cost_fifo') || getNestedValue(row, 'total_cost') || 0), 0),
                issued_by: '',
              }}
            />
          )}
          {!loading && activeReport === 'transfers' && (
            <GenericReport
              title="Transfers"
              columns={[
                { key: 'reference', label: 'Ref' },
                { key: 'product.name', label: 'Product' },
                { key: 'from_location.name', label: 'From' },
                { key: 'to_location.name', label: 'To' },
                { key: 'quantity', label: 'Qty' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                reference: getNestedValue(row, 'reference') || getNestedValue(row, 'referenceNo') || '—',
                'product.name': getNestedValue(row, 'product.name') || getNestedValue(row, 'product') || '—',
                'from_location.name': getNestedValue(row, 'from_location.name') || getNestedValue(row, 'from_location') || '—',
                'to_location.name': getNestedValue(row, 'to_location.name') || getNestedValue(row, 'to_location') || '—',
                quantity: Number(getNestedValue(row, 'quantity') || 0),
              }))}
              totals={{
                reference: 'TOTAL',
                'product.name': '',
                'from_location.name': '',
                'to_location.name': '',
                quantity: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
              }}
            />
          )}
          {!loading && activeReport === 'damaged' && (
            <GenericReport
              title="Damaged Stock"
              columns={[
                { key: 'product.name', label: 'Product' },
                { key: 'location.name', label: 'Location' },
                { key: 'quantity', label: 'Qty' },
                { key: 'reason', label: 'Reason' },
                { key: 'reported_by', label: 'Reported By' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                'product.name': getNestedValue(row, 'product.name') || getNestedValue(row, 'product') || '—',
                'location.name': getNestedValue(row, 'location.name') || getNestedValue(row, 'location') || '—',
                quantity: Number(getNestedValue(row, 'quantity') || 0),
                reason: getNestedValue(row, 'reason') || '—',
                reported_by: getNestedValue(row, 'reported_by') || getNestedValue(row, 'created_by') || '—',
              }))}
              totals={{
                'product.name': 'TOTAL',
                'location.name': '',
                quantity: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
                reason: '',
                reported_by: '',
              }}
            />
          )}
          {!loading && activeReport === 'returns' && (
            <GenericReport
              title="Returns"
              columns={[
                { key: 'product.name', label: 'Product' },
                { key: 'location.name', label: 'Location' },
                { key: 'quantity', label: 'Qty' },
                { key: 'reason', label: 'Reason' },
                { key: 'created_by', label: 'Created By' },
              ]}
              rows={getTableRows(data?.data || []).map((row) => ({
                ...row,
                'product.name': getNestedValue(row, 'product.name') || getNestedValue(row, 'product') || '—',
                'location.name': getNestedValue(row, 'location.name') || getNestedValue(row, 'location') || '—',
                quantity: Number(getNestedValue(row, 'quantity') || 0),
                reason: getNestedValue(row, 'reason') || '—',
                created_by: getNestedValue(row, 'created_by') || getNestedValue(row, 'reported_by') || '—',
              }))}
              totals={{
                'product.name': 'TOTAL',
                'location.name': '',
                quantity: getTableRows(data?.data || []).reduce((sum, row) => sum + Number(getNestedValue(row, 'quantity') || 0), 0),
                reason: '',
                created_by: '',
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;

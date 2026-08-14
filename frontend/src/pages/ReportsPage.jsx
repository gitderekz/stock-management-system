import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';

const ReportsPage = () => {
  const { token } = useAuth();
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
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
      setData(response.data || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport, dateRange]);

  const OverviewReport = () => (
    <div className="report-grid">
      <div className="report-card">
        <div className="report-title">Total Products</div>
        <div className="report-value">{data?.totalProducts || 0}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Stock Value</div>
        <div className="report-value">TZS {(data?.totalStockValue || 0).toLocaleString()}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Low Stock</div>
        <div className="report-value" style={{ color: '#f59e0b' }}>{data?.lowStock || 0}</div>
      </div>
      <div className="report-card">
        <div className="report-title">Out of Stock</div>
        <div className="report-value" style={{ color: '#ef4444' }}>{data?.outOfStock || 0}</div>
      </div>

      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h4>Today's Activity</h4>
        <div className="info-grid">
          <div className="info-item">
            <label>Stock In</label>
            <div className="text-success">{data?.stockInToday || 0} units</div>
          </div>
          <div className="info-item">
            <label>Stock Out</label>
            <div className="text-danger">{data?.stockOutToday || 0} units</div>
          </div>
          <div className="info-item">
            <label>Transfers</label>
            <div className="text-info">{data?.transfersToday || 0}</div>
          </div>
          <div className="info-item">
            <label>Damaged</label>
            <div className="text-danger">{data?.damagedToday || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ValuationReport = () => (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Cost</th>
            <th>Total Value</th>
            <th>Batch Aging</th>
          </tr>
        </thead>
        <tbody>
          {(data?.valuations || []).map((val, idx) => {
            const daysOld = val.daysInStock || 0;
            let ageColor = '#10b981';
            if (daysOld > 180) ageColor = '#ef4444';
            else if (daysOld > 90) ageColor = '#f59e0b';
            return (
              <tr key={idx}>
                <td>{val.productName}</td>
                <td>{val.quantity}</td>
                <td>TZS {Number(val.unitCost || 0).toLocaleString()}</td>
                <td>TZS {Number(val.totalValue || 0).toLocaleString()}</td>
                <td style={{ color: ageColor }}>{daysOld} days</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const LowStockReport = () => (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Current</th>
            <th>Reorder Level</th>
            <th>Shortage</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {(data?.lowStockProducts || []).map((prod, idx) => {
            const shortage = Math.max(0, prod.reorderLevel - prod.currentStock);
            let priorityColor = '#3b82f6';
            if (prod.currentStock === 0) priorityColor = '#ef4444';
            else if (shortage > prod.reorderLevel * 0.5) priorityColor = '#f59e0b';
            return (
              <tr key={idx}>
                <td>{prod.productName}</td>
                <td>{prod.currentStock}</td>
                <td>{prod.reorderLevel}</td>
                <td style={{ color: '#ef4444' }}>{shortage}</td>
                <td style={{ color: priorityColor }}>
                  {prod.currentStock === 0 ? 'CRITICAL' : shortage > prod.reorderLevel * 0.5 ? 'HIGH' : 'MEDIUM'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const MovementsReport = () => (
    <div>
      <div className="info-grid">
        <div className="info-item">
          <label>Total Stock In</label>
          <div style={{ color: '#10b981', fontSize: '1.5em', fontWeight: 'bold' }}>{data?.totalStockIn || 0} units</div>
        </div>
        <div className="info-item">
          <label>Total Stock Out</label>
          <div style={{ color: '#ef4444', fontSize: '1.5em', fontWeight: 'bold' }}>{data?.totalStockOut || 0} units</div>
        </div>
        <div className="info-item">
          <label>Total Transfers</label>
          <div style={{ color: '#3b82f6', fontSize: '1.5em', fontWeight: 'bold' }}>{data?.totalTransfers || 0} units</div>
        </div>
      </div>
    </div>
  );

  const AuditReport = () => (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          {(data?.auditLogs || []).slice(0, 50).map((log, idx) => (
            <tr key={idx}>
              <td className="font-size-sm">{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user?.fullName || 'System'}</td>
              <td><span className="badge badge-info">{log.action}</span></td>
              <td>{log.entityType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
              <label className="field-label">End Date:</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
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
          {!loading && activeReport === 'low-stock' && <LowStockReport />}
          {!loading && activeReport === 'movements' && <MovementsReport />}
          {!loading && activeReport === 'audit' && <AuditReport />}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;

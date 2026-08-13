import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/export.js';

const ReportsPage = () => {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('inventory');

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/reports', token);
      setReport(response.data || null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [token]);

  const handleExport = (format) => {
    if (!report) return;

    const reportData = [];
    if (reportType === 'inventory') {
      reportData.push(['Metric', 'Value']);
      reportData.push(['Total Products', report.inventory.totalProducts]);
      reportData.push(['Total Stock Value', `TZS ${report.inventory.totalStockValue}`]);
      reportData.push(['Low Stock Items', report.inventory.lowStock]);
      reportData.push(['Out of Stock', report.inventory.outOfStock]);
      reportData.push(['Damaged Items', report.inventory.damaged]);
    } else if (reportType === 'movements') {
      reportData.push(['Metric', 'Today']);
      reportData.push(['Stock In', report.movements.stockInToday]);
      reportData.push(['Stock Out', report.movements.stockOutToday]);
      reportData.push(['Transfers', report.movements.transfersToday]);
      reportData.push(['Damaged', report.movements.damagedToday]);
    } else if (reportType === 'purchases') {
      reportData.push(['Supplier', 'Total Value (TZS)']);
      report.purchases.purchaseBySupplier.forEach((item) => {
        reportData.push([item.supplier, item.value]);
      });
    }

    if (format === 'csv') {
      const csv = reportData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'xls') {
      const ws = XLSX.utils.aoa_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `report-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 10, 10);
      doc.autoTable({ head: [reportData[0]], body: reportData.slice(1), startY: 20 });
      doc.save(`report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  if (loading) return <section className="content-space"><p>Loading reports...</p></section>;

  return (
    <section className="content-space">
      <article className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Reports</div>
            <h3 className="panel-title">Analytics & Insights</h3>
          </div>
          <div className="toolbar-actions">
            <div className="toolbar-group">
              <select className="text-input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="inventory">Inventory Report</option>
                <option value="movements">Movement Report</option>
                <option value="purchases">Purchase Report</option>
              </select>
            </div>
            <div className="toolbar-group">
              <button className="btn btn-light" onClick={() => handleExport('csv')}>CSV</button>
              <button className="btn btn-light" onClick={() => handleExport('xls')}>Excel</button>
              <button className="btn btn-light" onClick={() => handleExport('pdf')}>PDF</button>
              <button className="btn btn-primary" onClick={loadReport}>Refresh</button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {report && reportType === 'inventory' && (
          <div>
            <div className="report-grid">
              <article className="report-card">
                <div className="report-title">Total Products</div>
                <div className="report-value">{report.inventory.totalProducts}</div>
                <div className="muted">Active SKUs</div>
              </article>
              <article className="report-card">
                <div className="report-title">Inventory Value</div>
                <div className="report-value">TZS {Number(report.inventory.totalStockValue).toLocaleString()}</div>
                <div className="muted">Current holdings</div>
              </article>
              <article className="report-card">
                <div className="report-title">Low Stock</div>
                <div className="report-value">{report.inventory.lowStock}</div>
                <div className="muted">Below minimum threshold</div>
              </article>
              <article className="report-card">
                <div className="report-title">Out of Stock</div>
                <div className="report-value">{report.inventory.outOfStock}</div>
                <div className="muted">Requires reordering</div>
              </article>
              <article className="report-card">
                <div className="report-title">Damaged Items</div>
                <div className="report-value">{report.inventory.damaged}</div>
                <div className="muted">Total damaged units</div>
              </article>
            </div>
          </div>
        )}

        {report && reportType === 'movements' && (
          <div>
            <div className="report-grid">
              <article className="report-card">
                <div className="report-title">Stock In Today</div>
                <div className="report-value">{report.movements.stockInToday}</div>
                <div className="muted">Receiving records</div>
              </article>
              <article className="report-card">
                <div className="report-title">Stock Out Today</div>
                <div className="report-value">{report.movements.stockOutToday}</div>
                <div className="muted">Issuing records</div>
              </article>
              <article className="report-card">
                <div className="report-title">Transfers Today</div>
                <div className="report-value">{report.movements.transfersToday}</div>
                <div className="muted">Inter-location moves</div>
              </article>
              <article className="report-card">
                <div className="report-title">Damaged Today</div>
                <div className="report-value">{report.movements.damagedToday}</div>
                <div className="muted">Damage records</div>
              </article>
            </div>
          </div>
        )}

        {report && reportType === 'purchases' && (
          <div>
            <article className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Purchases by Supplier</h3>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Total Value (TZS)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.purchases.purchaseBySupplier.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.supplier}</td>
                      <td>TZS {Number(item.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  <tr className="table-summary">
                    <td><strong>Total</strong></td>
                    <td><strong>TZS {Number(report.purchases.totalPurchases).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong></td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
        )}
      </article>
    </section>
  );
};

export default ReportsPage;

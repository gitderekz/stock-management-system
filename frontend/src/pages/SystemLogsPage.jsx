import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api.js';

const SystemLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDays, setFilterDays] = useState('30');
  const [search, setSearch] = useState('');

  const loadLogs = async (entity = '', action = '', days = '30') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entity) params.append('entity', entity);
      if (action) params.append('action', action);
      if (days) params.append('days', days);
      
      const response = await apiGet(`/system-logs?${params.toString()}`, token);
      setLogs(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(filterEntity, filterAction, filterDays);
  }, [filterEntity, filterAction, filterDays]);

  const entities = [...new Set(logs.map(log => log.entity))].sort();
  const actions = [...new Set(logs.map(log => log.action))].sort();

  const filtered = logs.filter((log) => {
    const query = search.toLowerCase();
    return (
      (log.user?.toLowerCase() || '').includes(query) ||
      (log.email?.toLowerCase() || '').includes(query) ||
      (log.message?.toLowerCase() || '').includes(query) ||
      (log.ipAddress?.toLowerCase() || '').includes(query)
    );
  });

  const getActionBadgeClass = (action) => {
    const classMap = {
      'create': 'badge-success',
      'read': 'badge-info',
      'update': 'badge-warning',
      'delete': 'badge-danger',
      'login': 'badge-primary',
      'logout': 'badge-secondary',
      'export': 'badge-info',
      'import': 'badge-info',
    };
    return classMap[action] || 'badge-default';
  };

  return (
    <section className="content-space">
      <article className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Audit Trail</div>
            <h3 className="panel-title">System Logs</h3>
          </div>
          <button className="btn btn-primary" onClick={() => loadLogs(filterEntity, filterAction, filterDays)}>Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div className="field-group">
            <label className="field-label">Search</label>
            <input
              className="text-input"
              placeholder="User, email, IP, message..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Entity</label>
            <select className="text-input" value={filterEntity} onChange={(event) => setFilterEntity(event.target.value)}>
              <option value="">All Entities</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Action</label>
            <select className="text-input" value={filterAction} onChange={(event) => setFilterAction(event.target.value)}>
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>{action.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Days</label>
            <select className="text-input" value={filterDays} onChange={(event) => setFilterDays(event.target.value)}>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div className="alert alert-info">Loading logs...</div>}

        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Email</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Message</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id || `${log.timestamp}-${log.userId}`}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td><strong>{log.user || 'System'}</strong></td>
                <td style={{ fontSize: '0.9em', color: '#666' }}>{log.email || 'N/A'}</td>
                <td><span className={`badge ${getActionBadgeClass(log.action)}`}>{log.action?.toUpperCase() || 'N/A'}</span></td>
                <td>{log.entity || 'N/A'}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.message}>{log.message || '-'}</td>
                <td style={{ fontSize: '0.85em', color: '#999', fontFamily: 'monospace' }}>{log.ipAddress || 'N/A'}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="7" className="empty-row">{logs.length > 0 ? 'No matching logs found.' : 'No log entries found.'}</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ marginTop: '12px', color: '#666', fontSize: '0.9em' }}>
          Showing {filtered.length} of {logs.length} total logs
        </div>
      </article>
    </section>
  );
};

export default SystemLogsPage;

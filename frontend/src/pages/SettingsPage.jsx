import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPut } from '../api.js';

const SettingsPage = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    systemName: 'Stock Management System',
    systemLogo: '',
    supportEmail: 'support@example.com',
    defaultLanguage: 'en',
    timezone: 'Africa/Dar_es_Salaam',
    theme: 'light',
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
    maintenanceMessage: '',
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    lowStockThreshold: 5,
    currencySymbol: 'TZS',
    dateFormat: 'DD/MM/YYYY',
    enableAuditLogs: true,
    enableTwoFactor: false,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const loadSettings = async () => {
    try {
      const response = await apiGet('/settings', token);
      setSettings((prev) => ({ ...prev, ...(response.data || {}) }));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await apiPut('/settings', settings, token);
      setMessage('Settings updated successfully.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="content-space">
      <article className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Administration</div>
            <h3 className="panel-title">System Settings</h3>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #ddd', marginBottom: '24px' }}>
          <button
            className={`btn btn-ghost ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`btn btn-ghost ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
          <button
            className={`btn btn-ghost ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`btn btn-ghost ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        <form className="settings-grid" onSubmit={handleSave}>
          {activeTab === 'general' && (
            <>
              <div className="field-group">
                <label className="field-label">System Name</label>
                <input
                  className="text-input"
                  name="systemName"
                  value={settings.systemName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">Support Email</label>
                <input
                  className="text-input"
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="field-label">System Logo URL</label>
                <input
                  className="text-input"
                  name="systemLogo"
                  value={settings.systemLogo}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              <div className="field-group">
                <label className="field-label">Currency Symbol</label>
                <input
                  className="text-input"
                  name="currencySymbol"
                  value={settings.currencySymbol}
                  onChange={handleChange}
                  maxLength="3"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Date Format</label>
                <select
                  className="text-input"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Default Language</label>
                <select
                  className="text-input"
                  name="defaultLanguage"
                  value={settings.defaultLanguage}
                  onChange={handleChange}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Timezone</label>
                <select
                  className="text-input"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                >
                  <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam (UTC+3)</option>
                  <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                  <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Theme</label>
                <select
                  className="text-input"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'system' && (
            <>
              <div className="field-group">
                <label className="field-label">Low Stock Threshold</label>
                <input
                  className="text-input"
                  type="number"
                  name="lowStockThreshold"
                  value={settings.lowStockThreshold}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  {' '}Enable Maintenance Mode
                </label>
              </div>
              {settings.maintenanceMode && (
                <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="field-label">Maintenance Message</label>
                  <textarea
                    className="text-input"
                    name="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Message to display to users during maintenance"
                  />
                </div>
              )}
              <div className="field-group">
                <label className="field-label">
                  <input
                    type="checkbox"
                    name="enableAuditLogs"
                    checked={settings.enableAuditLogs}
                    onChange={handleChange}
                  />
                  {' '}Enable Audit Logging
                </label>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="field-group">
                <label className="field-label">Max Login Attempts</label>
                <input
                  className="text-input"
                  type="number"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Session Timeout (minutes)</label>
                <input
                  className="text-input"
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  min="5"
                  max="480"
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  <input
                    type="checkbox"
                    name="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onChange={handleChange}
                  />
                  {' '}Enable Two-Factor Authentication
                </label>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="field-group">
                <label className="field-label">
                  <input
                    type="checkbox"
                    name="enableNotifications"
                    checked={settings.enableNotifications}
                    onChange={handleChange}
                  />
                  {' '}Enable In-App Notifications
                </label>
              </div>
              <div className="field-group">
                <label className="field-label">
                  <input
                    type="checkbox"
                    name="enableEmailAlerts"
                    checked={settings.enableEmailAlerts}
                    onChange={handleChange}
                  />
                  {' '}Enable Email Alerts
                </label>
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary">
              Save All Settings
            </button>
          </div>
        </form>
      </article>
    </section>
  );
};

export default SettingsPage;

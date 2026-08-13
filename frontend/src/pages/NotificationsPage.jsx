import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const NotificationsPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState('user'); // 'user' or 'admin'
  const [search, setSearch] = useState('');
  
  // Form for creating/editing notifications
  const [form, setForm] = useState({ title: '', body: '', type: 'info', sendToAll: false, roleIds: [], userIds: [] });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadNotifications = async () => {
    try {
      const response = await apiGet('/notifications', token);
      setNotifications((response.data || []).map((item, index) => ({
        ...item,
        id: item.id || index,
        read: item.seen || false,
      })));
    } catch (err) {
      setError(err.message);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiGet('/roles', token);
      setRoles(response.data || []);
    } catch (err) {
      console.error('Failed to load roles:', err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiGet('/users', token);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users:', err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Check if user has admin/manage permissions (this is a simple check)
    // In production, should check against actual user permissions
    loadRoles();
    loadUsers();
    setIsAdmin(true); // Simplified for now - in production, check actual permissions
  }, [token]);

  // User View - Notifications list
  const userNotifications = notifications.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.body?.toLowerCase().includes(search.toLowerCase())
  );

  // Admin View - All notifications for management
  const allNotifications = notifications.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.body?.toLowerCase().includes(search.toLowerCase()) ||
    n.type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiPut(`/notifications/${notificationId}/mark-seen`, {}, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true, seen: true } : n))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => apiPut(`/notifications/${n.id}/mark-seen`, {}, token))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setMessage('All notifications marked as read.');
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setSelectedNotification(null);
    setForm({ title: '', body: '', type: 'info', sendToAll: false, roleIds: [], userIds: [] });
    createEditModal.open();
  };

  const openEditModal = (notification) => {
    setSelectedNotification(notification);
    setForm({
      title: notification.title,
      body: notification.body,
      type: notification.type || 'info',
      sendToAll: false,
      roleIds: [],
      userIds: [],
    });
    createEditModal.open();
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleToggle = (roleId) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleUserToggle = (userId) => {
    setForm((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and message are required.');
      return;
    }

    try {
      if (selectedNotification) {
        await apiPut(`/notifications/${selectedNotification.id}`, form, token);
        setMessage('Notification updated successfully.');
      } else {
        await apiPost('/notifications', form, token);
        setMessage('Notification sent successfully.');
      }
      setError('');
      createEditModal.close();
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (notification) => {
    setDeleteTarget(notification);
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/notifications/${deleteTarget.id}`, token);
      setMessage('Notification deleted successfully.');
      setError('');
      confirmModal.close();
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="content-space">
      {isAdmin && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <button
            className={`btn ${viewMode === 'user' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('user')}
          >
            My Notifications
          </button>
          <button
            className={`btn ${viewMode === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('admin')}
          >
            Manage Notifications
          </button>
        </div>
      )}

      <article className="panel panel-dashboard-header">
        <div className="panel-header">
          <div>
            <div className="panel-label">Communication</div>
            <h3 className="panel-title">{viewMode === 'admin' ? 'Manage Notifications' : 'Notifications'}</h3>
          </div>
          <div className="toolbar-actions">
            <input
              className="text-input"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {viewMode === 'user' && (
              <button className="btn btn-light" onClick={handleMarkAllRead}>Mark all read</button>
            )}
            {viewMode === 'admin' && (
              <button className="btn btn-primary" onClick={openCreateModal}>+ Send Notification</button>
            )}
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {viewMode === 'user' ? (
          <div className="notification-list">
            {userNotifications.length > 0 ? (
              userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'notification-read' : ''}`}
                  style={{
                    padding: '12px',
                    borderLeft: notification.read ? '3px solid #ddd' : '3px solid #ff9800',
                    cursor: 'pointer',
                  }}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span className={`feed-icon ${notification.type || 'info'}`}>
                      {notification.read ? '✓' : '●'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="feed-title">{notification.title || 'System notification'}</div>
                      <div className="feed-body">{notification.body || 'You have a new update.'}</div>
                      <div style={{ fontSize: '0.85em', color: '#999', marginTop: '4px' }}>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No notifications yet
              </div>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allNotifications.map((notification) => (
                <tr key={notification.id}>
                  <td><strong>{notification.title}</strong></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notification.body}
                  </td>
                  <td><span className="badge badge-info">{notification.type || 'info'}</span></td>
                  <td>{new Date(notification.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => openEditModal(notification)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(notification)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!allNotifications.length && (
                <tr><td colSpan="5" className="empty-row">No notifications found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </article>

      {viewMode === 'admin' && (
        <Modal isOpen={createEditModal.isOpen} title={selectedNotification ? 'Edit Notification' : 'Send Notification'} onClose={createEditModal.close} size="large">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Title</label>
              <input
                className="text-input"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Type</label>
              <select className="text-input" name="type" value={form.type} onChange={handleFormChange}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Message</label>
              <textarea
                className="text-input"
                name="body"
                value={form.body}
                onChange={handleFormChange}
                rows="4"
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">
                <input
                  type="checkbox"
                  name="sendToAll"
                  checked={form.sendToAll}
                  onChange={handleFormChange}
                />
                {' '}Send to all users
              </label>
            </div>
            {!form.sendToAll && (
              <>
                <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="field-label">Select Roles</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {roles.map((role) => (
                      <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={form.roleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="field-label">Select Users</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '200px', overflow: 'auto' }}>
                    {users.map((user) => (
                      <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={form.userIds.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                        />
                        {user.fullName}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">
                {selectedNotification ? 'Update Notification' : 'Send Notification'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete this notification?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default NotificationsPage;

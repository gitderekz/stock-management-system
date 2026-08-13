import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { useSearch } from '../context/SearchContext.jsx';

const UsersPage = () => {
  const { token } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', roleId: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    try {
      const response = await apiGet('/users', token);
      setUsers(response.data || []);
      setError('');
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

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [token]);

  const filtered = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.roleName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedUser(null);
    setForm({ fullName: '', email: '', password: '', roleId: '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({ fullName: user.fullName, email: user.email, password: '', roleId: user.roleId || '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    try {
      if (selectedUser) {
        const payload = { fullName: form.fullName.trim(), roleId: form.roleId || null };
        if (form.password.trim()) payload.password = form.password.trim();
        const response = await apiPut(`/users/${selectedUser.id}`, payload, token);
        setUsers((prev) => prev.map((item) => (item.id === selectedUser.id ? response.user : item)));
        setMessage('User updated successfully.');
      } else {
        const response = await apiPost('/auth/register', {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          roleId: form.roleId || null,
        }, token);
        setUsers((prev) => [response.user, ...prev]);
        setMessage('User added successfully.');
      }
      setError('');
      createEditModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (user) => {
    setDeleteTarget(user);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/users/${deleteTarget.id}`, token);
      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage('User deleted successfully.');
      setError('');
      confirmModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="content-space">
      <article className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">Administration</div>
            <h3 className="panel-title">Users & Roles</h3>
          </div>
          <div className="toolbar-actions">
            <input
              className="text-input"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New User
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td><span className="badge badge-info">{user.roleName || 'Unassigned'}</span></td>
                <td><span className={`status status-${user.status === 'active' ? 'active' : user.status}`}>{user.status || 'Active'}</span></td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(user)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(user)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="5" className="empty-row">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </article>

      <Modal isOpen={createEditModal.isOpen} title={selectedUser ? 'Edit User' : 'Add User'} onClose={createEditModal.close} size="medium">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className="text-input" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="text-input" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input className="text-input" type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder={selectedUser ? 'Enter new password to change it' : ''} />
          </div>
          <div className="field-group">
            <label className="field-label">Role</label>
            <select className="text-input" value={form.roleId} onChange={(event) => setForm((prev) => ({ ...prev, roleId: event.target.value }))}>
              <option value="">-- Select Role --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}{role.description ? ` (${role.description})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{selectedUser ? 'Save Changes' : 'Create User'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default UsersPage;

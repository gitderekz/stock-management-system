import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';

const RolesPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', permissionIds: [] });
  const [selectedRole, setSelectedRole] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadRoles = async () => {
    try {
      const response = await apiGet('/roles', token);
      setRoles(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await apiGet('/permissions', token);
      setPermissions(response.data || []);
    } catch (err) {
      console.error('Failed to load permissions:', err.message);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, [token]);

  const filtered = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    (role.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const usePaginatedRows = (rows, pageSize = 10) => {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [rows?.length]);
    const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const visibleRows = rows?.slice(startIndex, startIndex + pageSize) || [];
    return { page: safePage, setPage, totalPages, visibleRows };
  };

  const paginated = usePaginatedRows(filtered, 10);
  const { page: rolePage, setPage: setRolePage, totalPages: roleTotal, visibleRows: visibleRoles } = paginated;

  const openCreateModal = () => {
    setSelectedRole(null);
    setForm({ name: '', description: '', permissionIds: [] });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    const rolePermissionIds = role.permissions?.map(p => p.id) || [];
    setForm({
      name: role.name,
      description: role.description || '',
      permissionIds: rolePermissionIds,
    });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handlePermissionToggle = (permId) => {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Role name is required.');
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        permissionIds: form.permissionIds,
      };

      if (selectedRole) {
        await apiPut(`/roles/${selectedRole.id}`, payload, token);
        setMessage('Role updated successfully.');
      } else {
        await apiPost('/roles', payload, token);
        setMessage('Role created successfully.');
      }

      setError('');
      createEditModal.close();
      loadRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (role) => {
    setDeleteTarget(role);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/roles/${deleteTarget.id}`, token);
      setMessage('Role deleted successfully.');
      setError('');
      confirmModal.close();
      loadRoles();
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
            <h3 className="panel-title">Roles & Permissions</h3>
          </div>
          <div className="toolbar-actions">
            <input
              className="text-input"
              placeholder="Search roles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New Role
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRoles.map((role) => (
              <tr key={role.id}>
                <td><strong>{role.name}</strong></td>
                <td>{role.description || 'N/A'}</td>
                <td>{role.permissions?.length || 0} permissions</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(role)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(role)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="4" className="empty-row">No roles found.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setRolePage((p) => Math.max(1, p - 1))} disabled={rolePage === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {rolePage}/{roleTotal}</span>
            <button className="btn btn-light" onClick={() => setRolePage((p) => Math.min(roleTotal, p + 1))} disabled={rolePage >= roleTotal}>Next</button>
          </div>
        )}
      </article>

      <Modal isOpen={createEditModal.isOpen} title={selectedRole ? 'Edit Role' : 'Create Role'} onClose={createEditModal.close} size="large">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Role Name</label>
            <input
              className="text-input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <input
              className="text-input"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Brief role description"
            />
          </div>
          <div className="field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="field-label">Permissions</label>
            <div className="permissions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {permissions.map((permission) => (
                <label key={`perm-${permission.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
                  <input
                    type="checkbox"
                    checked={form.permissionIds.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                  />
                  <span>{permission.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">{selectedRole ? 'Save Changes' : 'Create Role'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete the role <strong>{deleteTarget?.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default RolesPage;

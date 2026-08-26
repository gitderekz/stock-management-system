import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { useSearch } from '../context/SearchContext.jsx';

const LocationsPage = () => {
  const { token } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', type: 'warehouse', address: '' });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const normalizeResponseData = (response) => response?.data?.data ?? response?.data ?? response ?? null;

  const loadLocations = async () => {
    try {
      const response = await apiGet('/locations', token);
      setLocations(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [token]);

  const filtered = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination for locations
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
  const { page, setPage, totalPages, visibleRows } = paginated;

  const openCreateModal = () => {
    setSelectedLocation(null);
    setForm({ name: '', code: '', type: 'warehouse', address: '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setForm({ name: location.name, code: location.code, type: location.type || 'warehouse', address: location.address || '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError('Location name and code are required.');
      return;
    }

    try {
      if (selectedLocation) {
        const response = await apiPut(`/locations/${selectedLocation.id}`, {
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type,
          address: form.address.trim(),
        }, token);
        const updatedLocation = normalizeResponseData(response) || selectedLocation;
        setLocations((prev) => prev.map((item) => (item.id === selectedLocation.id ? updatedLocation : item)));
        setMessage('Location updated successfully.');
      } else {
        const response = await apiPost('/locations', {
          name: form.name.trim(),
          code: form.code.trim(),
          type: form.type,
          address: form.address.trim(),
        }, token);
        const created = normalizeResponseData(response) || { id: Date.now(), ...form };
        setLocations((prev) => [created, ...prev]);
        setMessage('Location created successfully.');
      }
      setError('');
      createEditModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (location) => {
    setDeleteTarget(location);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/locations/${deleteTarget.id}`, token);
      setLocations((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage('Location deleted successfully.');
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
            <div className="panel-label">Locations</div>
            <h3 className="panel-title">Warehouses and Stores</h3>
          </div>
          <div className="toolbar-actions">
            <input
              className="text-input"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New Location
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Code</th><th>Type</th><th>Address</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visibleRows.map((location) => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td>{location.code}</td>
                <td>{location.type}</td>
                <td>{location.address || '—'}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(location)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(location)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="5" className="empty-row">No locations found.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px' }}>
            <button className="btn btn-light" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span style={{ fontSize: 12, color: '#475569' }}>Page {page}/{totalPages}</span>
            <button className="btn btn-light" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </div>
        )}
      </article>

      <Modal isOpen={createEditModal.isOpen} title={selectedLocation ? 'Edit Location' : 'Create Location'} onClose={createEditModal.close} size="medium">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Location Name</label>
            <input className="text-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Code</label>
            <input className="text-input" value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Type</label>
            <select className="text-input" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="warehouse">Warehouse</option>
              <option value="store">Store</option>
              <option value="branch">Branch</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Address</label>
            <input className="text-input" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{selectedLocation ? 'Save Changes' : 'Create Location'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete location <strong>{deleteTarget?.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default LocationsPage;

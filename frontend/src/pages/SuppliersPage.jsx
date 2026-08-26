import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { useSearch } from '../context/SearchContext.jsx';

const SuppliersPage = () => {
  const { token } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const normalizeResponseData = (response) => response?.data?.data ?? response?.data ?? response ?? null;

  const loadSuppliers = async () => {
    try {
      const response = await apiGet('/suppliers', token);
      setSuppliers(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [token]);

  const filtered = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination for suppliers
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
    setSelectedSupplier(null);
    setForm({ name: '', phone: '', email: '', address: '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setForm({ name: supplier.name, phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Supplier name and email are required.');
      return;
    }

    try {
      if (selectedSupplier) {
        const response = await apiPut(`/suppliers/${selectedSupplier.id}`, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }, token);
        const updatedSupplier = normalizeResponseData(response) || selectedSupplier;
        setSuppliers((prev) => prev.map((item) => (item.id === selectedSupplier.id ? updatedSupplier : item)));
        setMessage('Supplier updated successfully.');
      } else {
        const response = await apiPost('/suppliers', {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }, token);
        const created = normalizeResponseData(response) || { id: Date.now(), ...form };
        setSuppliers((prev) => [created, ...prev]);
        setMessage('Supplier created successfully.');
      }
      setError('');
      createEditModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (supplier) => {
    setDeleteTarget(supplier);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/suppliers/${deleteTarget.id}`, token);
      setSuppliers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage('Supplier deleted successfully.');
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
            <div className="panel-label">Purchasing</div>
            <h3 className="panel-title">Suppliers</h3>
          </div>
          <div className="toolbar-actions">
            <input
              type="search"
              className="text-input"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New Supplier
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visibleRows.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.phone || '—'}</td>
                <td>{supplier.email || '—'}</td>
                <td>{supplier.address || '—'}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(supplier)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(supplier)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="5" className="empty-row">No suppliers found.</td></tr>
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

      <Modal isOpen={createEditModal.isOpen} title={selectedSupplier ? 'Edit Supplier' : 'Create Supplier'} onClose={createEditModal.close} size="medium">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Supplier Name</label>
            <input className="text-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="text-input" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Phone</label>
            <input className="text-input" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">Address</label>
            <input className="text-input" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{selectedSupplier ? 'Save Changes' : 'Create Supplier'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete supplier <strong>{deleteTarget?.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default SuppliersPage;

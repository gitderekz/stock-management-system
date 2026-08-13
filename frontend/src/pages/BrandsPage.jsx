import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { useSearch } from '../context/SearchContext.jsx';

const BrandsPage = () => {
  const { token } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', website: '' });
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadBrands = async () => {
    try {
      const response = await apiGet('/brands', token);
      setBrands(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [token]);

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const openCreateModal = () => {
    setSelectedBrand(null);
    setForm({ name: '', description: '', website: '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setForm({ name: brand.name, description: brand.description || '', website: brand.website || '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Brand name is required.');
      return;
    }

    try {
      if (selectedBrand) {
        const response = await apiPut(`/brands/${selectedBrand.id}`, { name: form.name.trim(), description: form.description.trim(), website: form.website.trim() }, token);
        setBrands((prev) => prev.map((item) => (item.id === selectedBrand.id ? response.data.data : item)));
        setMessage('Brand updated successfully.');
      } else {
        const response = await apiPost('/brands', { name: form.name.trim(), description: form.description.trim(), website: form.website.trim() }, token);
        setBrands((prev) => [response.data.data, ...prev]);
        setMessage('Brand created successfully.');
      }
      setError('');
      createEditModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (brand) => {
    setDeleteTarget(brand);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/brands/${deleteTarget.id}`, token);
      setBrands((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage('Brand deleted successfully.');
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
            <div className="panel-label">Catalog</div>
            <h3 className="panel-title">Brands / Makers</h3>
          </div>
          <div className="toolbar-actions">
            <input
              type="search"
              className="text-input"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New Brand
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Website</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredBrands.map((brand) => (
              <tr key={brand.id}>
                <td>{brand.name}</td>
                <td>{brand.website || '—'}</td>
                <td>{brand.description || '—'}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(brand)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(brand)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filteredBrands.length && (
              <tr><td colSpan="4" className="empty-row">No brands found.</td></tr>
            )}
          </tbody>
        </table>
      </article>

      <Modal isOpen={createEditModal.isOpen} title={selectedBrand ? 'Edit Brand' : 'Create Brand'} onClose={createEditModal.close} size="medium">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Brand Name</label>
            <input className="text-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Website</label>
            <input className="text-input" value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea className="text-input" rows="4" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{selectedBrand ? 'Save Changes' : 'Create Brand'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete the brand <strong>{deleteTarget?.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default BrandsPage;

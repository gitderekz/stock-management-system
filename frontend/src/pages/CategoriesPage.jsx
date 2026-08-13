import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';
import Modal from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.js';
import { useSearch } from '../context/SearchContext.jsx';

const CategoriesPage = () => {
  const { token } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const createEditModal = useModal();
  const confirmModal = useModal();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = async () => {
    try {
      const response = await apiGet('/categories', token);
      setCategories(response.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const filtered = categories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const openCreateModal = () => {
    setSelectedCategory(null);
    setForm({ name: '', description: '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setForm({ name: category.name, description: category.description || '' });
    setMessage('');
    setError('');
    createEditModal.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      if (selectedCategory) {
        const response = await apiPut(`/categories/${selectedCategory.id}`, { name: form.name.trim(), description: form.description.trim() }, token);
        setCategories((prev) => prev.map((item) => (item.id === selectedCategory.id ? response.data.data : item)));
        setMessage('Category updated successfully.');
      } else {
        const response = await apiPost('/categories', { name: form.name.trim(), description: form.description.trim() }, token);
        setCategories((prev) => [response.data.data, ...prev]);
        setMessage('Category created successfully.');
      }
      setError('');
      createEditModal.close();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (category) => {
    setDeleteTarget(category);
    setError('');
    confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/categories/${deleteTarget.id}`, token);
      setCategories((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setMessage('Category deleted successfully.');
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
            <h3 className="panel-title">Categories</h3>
          </div>
          <div className="toolbar-actions">
            <input
              type="search"
              className="text-input"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + New Category
            </button>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table">
          <thead>
            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || 'No description'}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => openEditModal(category)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(category)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="3" className="empty-row">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </article>

      <Modal isOpen={createEditModal.isOpen} title={selectedCategory ? 'Edit Category' : 'Create Category'} onClose={createEditModal.close} size="medium">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Category Name</label>
            <input className="text-input" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea className="text-input" rows="4" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{selectedCategory ? 'Save Changes' : 'Create Category'}</button>
            <button type="button" className="btn btn-ghost" onClick={createEditModal.close}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={confirmModal.isOpen} title="Confirm Delete" onClose={confirmModal.close} size="small">
        <div>
          <p>Are you sure you want to delete the category <strong>{deleteTarget?.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button type="button" className="btn btn-ghost" onClick={confirmModal.close}>Cancel</button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default CategoriesPage;

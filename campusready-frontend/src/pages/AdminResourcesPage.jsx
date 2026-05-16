import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createResource, deleteResource, getResources, updateResource } from '../services/api';

const categoryOptions = [
  { value: '', label: 'Select a category' },
  { value: 'CONTACTS', label: 'Emergency Contacts' },
  { value: 'GUIDES', label: 'Disaster Preparedness Guides' },
  { value: 'CHECKLISTS', label: 'Emergency Checklists' },
  { value: 'DOWNLOADS', label: 'Downloadable Resources' },
];

const resourceTypeOptions = [
  { value: '', label: 'Select a resource type' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'PDF', label: 'PDF' },
  { value: 'GUIDE', label: 'Guide' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'DOCUMENT', label: 'Document' },
];

const initialFormState = {
  title: '',
  description: '',
  category: '',
  resourceType: '',
  linkOrContent: '',
};

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const navigate = useNavigate();

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      return filterCategory ? resource.category === filterCategory : true;
    });
  }, [resources, filterCategory]);

  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getResources();
        setResources(data);
      } catch {
        setError('Unable to load resources. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    if (editingResourceId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = formRef.current.querySelector('input, textarea, select');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [editingResourceId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormState(initialFormState);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      if (editingResourceId) {
        const updated = await updateResource(editingResourceId, formState);
        setResources((current) => current.map((item) => (item.id === editingResourceId ? updated : item)));
        setMessage('Resource updated successfully.');
      } else {
        const created = await createResource(formState);
        setResources((current) => [created, ...current]);
        setMessage('Resource created successfully.');
      }

      resetForm();
    } catch {
      setError(editingResourceId
        ? 'Unable to update resource. Please verify the fields and try again.'
        : 'Unable to create resource. Please verify the fields and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditResource = (resource) => {
    setError('');
    setMessage('');
    setEditingResourceId(resource.id);
    setFormState({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      resourceType: resource.resourceType,
      linkOrContent: resource.linkOrContent,
    });
  };

  const handleDeleteResource = async (resourceId) => {
    setError('');
    setMessage('');
    setIsDeletingId(resourceId);

    try {
      await deleteResource(resourceId);
      setResources((current) => current.filter((resource) => resource.id !== resourceId));
      setMessage('Resource deleted successfully.');
      if (editingResourceId === resourceId) {
        resetForm();
      }
    } catch {
      setError('Unable to delete resource. Please try again.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="page-container">
          <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady Admin</p>
            <h1>Resource Management</h1>
            <p>Create, edit, and remove emergency resources for campus users.</p>
            <div className="admin-header-buttons">
              <button type="button" className="primary-button admin-nav-button" onClick={() => navigate('/admin/modules')}>
                Manage Modules
              </button>
              <button type="button" className="secondary-button admin-nav-button" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-grid">
            <form className="admin-form-card" onSubmit={handleSubmit} ref={formRef}>
              <div className="admin-form-header">
                <h2>{editingResourceId ? 'Edit Resource' : 'Create Resource'}</h2>
                <p className="admin-form-copy">
                  {editingResourceId
                    ? 'Update the emergency resource details below or cancel to add a new one.'
                    : 'Add a resource that staff and students can access through the Emergency Resources Hub.'}
                </p>
              </div>

              {error && <p className="dashboard-status error">{error}</p>}
              {message && <p className="dashboard-status success">{message}</p>}

              <div className="admin-form-field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formState.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  required
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.value === ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-field">
                <label htmlFor="resourceType">Resource Type</label>
                <select
                  id="resourceType"
                  name="resourceType"
                  value={formState.resourceType}
                  onChange={handleChange}
                  required
                >
                  {resourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.value === ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-field">
                <label htmlFor="linkOrContent">Link or Resource URL</label>
                <input
                  id="linkOrContent"
                  name="linkOrContent"
                  type="text"
                  placeholder="https://example.com/resource.pdf or tel:+123456789"
                  value={formState.linkOrContent}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-actions">
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? (editingResourceId ? 'Saving changes...' : 'Creating resource...') : (editingResourceId ? 'Update Resource' : 'Create Resource')}
                </button>
                {editingResourceId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <section className="admin-modules-card">
              <div className="admin-modules-header">
                <h2>Existing Resources</h2>
                <div className="filter-field">
                  <label htmlFor="resource-filter">Filter by category</label>
                  <select
                    id="resource-filter"
                    value={filterCategory}
                    onChange={(event) => setFilterCategory(event.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.slice(1).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading && <p className="dashboard-status">Loading resources...</p>}
              {!isLoading && filteredResources.length === 0 && (
                <p className="dashboard-status">No resources available yet.</p>
              )}

              <div className="modules-grid admin-modules-grid" aria-label="Admin resource list">
                {filteredResources.map((resource) => (
                  <article className="module-card admin-card" key={resource.id}>
                    <div className="card-content">
                      <div className="module-card-header">
                        <h3>{resource.title}</h3>
                      </div>
                      <p>{resource.description}</p>
                      <div className="module-card-meta">
                        <span>{resource.category}</span>
                        <span>{resource.resourceType}</span>
                      </div>
                    </div>

                    <div className="module-card-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleEditResource(resource)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteResource(resource.id)}
                        disabled={isDeletingId === resource.id}
                      >
                        {isDeletingId === resource.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
        </div>
      </main>
    </>
  );
}

export default AdminResourcesPage;

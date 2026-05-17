import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createModule, deleteModule, getModules, updateModule } from '../services/api';

const disasterOptions = [
  { value: '', label: 'Select a disaster type' },
  { value: 'EARTHQUAKE', label: 'EARTHQUAKE' },
  { value: 'FLOOD', label: 'FLOOD' },
  { value: 'FIRE', label: 'FIRE' },
  { value: 'CYCLONE', label: 'CYCLONE' },
  { value: 'LANDSLIDE', label: 'LANDSLIDE' },
  { value: 'TSUNAMI', label: 'TSUNAMI' },
  { value: 'DROUGHT', label: 'DROUGHT' },
  { value: 'THUNDERSTORM', label: 'THUNDERSTORM' },
];

const disasterEmojiMap = {
  EARTHQUAKE: '🌍',
  FLOOD: '🌊',
  FIRE: '🔥',
  CYCLONE: '🌪️',
  LANDSLIDE: '⛰️',
  TSUNAMI: '🌊',
  DROUGHT: '☀️',
  THUNDERSTORM: '⛈️',
};

const initialFormState = {
  title: '',
  description: '',
  disasterType: '',
  content: '',
};

function AdminModulePage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);
  const navigate = useNavigate();

  const isEditing = Boolean(editingModuleId);
  const hasModules = useMemo(() => modules.length > 0, [modules]);

  const getDisasterEmoji = (type) => disasterEmojiMap[type] || '🛡️';

  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      setError('');

      try {
        const moduleData = await getModules();
        setModules(moduleData);
      } catch {
        setError('Unable to load modules. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (isEditing && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = formRef.current.querySelector('input, textarea, select');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isEditing]);

  const handleCreateModule = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (isEditing) {
        const updated = await updateModule(editingModuleId, formState);
        setModules((current) => current.map((module) => (module.id === editingModuleId ? updated : module)));
        setSuccess('Module updated successfully.');
        setEditingModuleId(null);
      } else {
        const created = await createModule(formState);
        setModules((current) => [created, ...current]);
        setSuccess('Module created successfully.');
      }

      setFormState(initialFormState);
    } catch {
      setError(isEditing
        ? 'Unable to update module. Please check the fields and try again.'
        : 'Unable to create module. Please check the fields and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    setError('');
    setSuccess('');
    setIsDeletingId(moduleId);

    try {
      await deleteModule(moduleId);
      setModules((current) => current.filter((module) => module.id !== moduleId));
      setSuccess('Module deleted successfully.');
      if (editingModuleId === moduleId) {
        setEditingModuleId(null);
        setFormState(initialFormState);
      }
    } catch {
      setError('Unable to delete module. Please try again.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEditModule = (module) => {
    setError('');
    setSuccess('');
    setEditingModuleId(module.id);
    setFormState({
      title: module.title,
      description: module.description,
      disasterType: module.disasterType,
      content: module.content,
    });
  };

  const handleCancelEdit = () => {
    setEditingModuleId(null);
    setFormState(initialFormState);
    setError('');
    setSuccess('');
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="page-container">
          <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady Admin</p>
            <h1>Module Management</h1>
            <p>Create, view, and delete training modules for your campus readiness program.</p>
            <div className="admin-header-buttons">
              <button type="button" className="primary-button admin-nav-button" onClick={() => navigate('/admin/quizzes')}>
                Manage Quizzes
              </button>
              <button type="button" className="secondary-button admin-nav-button" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-grid">
            <form className="admin-form-card" onSubmit={handleCreateModule} ref={formRef}>
              <div className="admin-form-header">
                <h2>{isEditing ? 'Edit Module' : 'Create Module'}</h2>
                <p className="admin-form-copy">
                  {isEditing
                    ? 'Update the module details, or cancel to return to module creation.'
                    : 'Add a new training module to keep campus teams ready and informed.'}
                </p>
              </div>

              {error && <p className="dashboard-status error">{error}</p>}
              {success && <p className="dashboard-status success">{success}</p>}

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
                <label htmlFor="disasterType">Disaster Type</label>
                <select
                  id="disasterType"
                  name="disasterType"
                  value={formState.disasterType}
                  onChange={handleChange}
                  required
                >
                  {disasterOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.value === ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-field">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formState.content}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-actions">
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? (isEditing ? 'Updating module...' : 'Saving module...') : (isEditing ? 'Update Module' : 'Create Module')}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <section className="admin-modules-card">
              <div className="admin-modules-header">
                <h2>Existing Modules</h2>
                {isLoading && <p className="subtle-text">Loading modules...</p>}
              </div>

              {!isLoading && !hasModules && (
                <p className="dashboard-status">No modules have been created yet.</p>
              )}

              <div className="modules-grid admin-modules-grid" aria-label="Admin module list">
                {modules.map((module) => (
                  <article className="module-card admin-card" key={module.id}>
  <div className="card-content">
    <div className="module-card-header">
      <h3>
        <span className="module-emoji">
          {getDisasterEmoji(module.disasterType)}
        </span>
        {module.title}
      </h3>
    </div>

    <p>{module.description}</p>

    <div className="module-card-meta">
      <span>{module.disasterType}</span>
    </div>
  </div>

  <div className="module-card-actions">
    <button
      type="button"
      className="edit-button"
      onClick={() => handleEditModule(module)}
    >
      Edit
    </button>

    <button
      type="button"
      className="delete-button"
      onClick={() => handleDeleteModule(module.id)}
      disabled={isDeletingId === module.id}
    >
      {isDeletingId === module.id ? 'Deleting...' : 'Delete'}
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

export default AdminModulePage;

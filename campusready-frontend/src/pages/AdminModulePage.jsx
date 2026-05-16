import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { createModule, deleteModule, getModules } from '../services/api';

const disasterOptions = [
  { value: '', label: 'Select a disaster type' },
  { value: 'EARTHQUAKE', label: 'EARTHQUAKE' },
  { value: 'FLOOD', label: 'FLOOD' },
  { value: 'FIRE', label: 'FIRE' },
  { value: 'CYCLONE', label: 'CYCLONE' },
  { value: 'LANDSLIDE', label: 'LANDSLIDE' },
  { value: 'TSUNAMI', label: 'TSUNAMI' },
];

const disasterEmojiMap = {
  EARTHQUAKE: '🌍',
  FLOOD: '🌊',
  FIRE: '🔥',
  CYCLONE: '🌪️',
  LANDSLIDE: '⛰️',
  TSUNAMI: '🌊',
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
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleCreateModule = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const created = await createModule(formState);
      setModules((current) => [created, ...current]);
      setFormState(initialFormState);
      setSuccess('Module created successfully.');
    } catch {
      setError('Unable to create module. Please check the fields and try again.');
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
    } catch {
      setError('Unable to delete module. Please try again.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady Admin</p>
            <h1>Module Management</h1>
            <p>Create, view, and delete training modules for your campus readiness program.</p>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-grid">
            <form className="admin-form-card" onSubmit={handleCreateModule}>
              <div className="admin-form-header">
                <h2>Create Module</h2>
                <p className="admin-form-copy">
                  Add a new training module to keep campus teams ready and informed.
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

              <button className="primary-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving module...' : 'Create Module'}
              </button>
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
                    <div className="module-card-header">
                      <h3>
                        <span className="module-emoji">{getDisasterEmoji(module.disasterType)}</span>
                        {module.title}
                      </h3>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteModule(module.id)}
                        disabled={isDeletingId === module.id}
                      >
                        {isDeletingId === module.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                    <p>{module.description}</p>
                    <div className="module-card-meta">
                      <span>{module.disasterType}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

export default AdminModulePage;

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { getResources } from '../services/api';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'CONTACTS', label: 'Emergency Contacts' },
  { value: 'GUIDES', label: 'Disaster Preparedness Guides' },
  { value: 'CHECKLISTS', label: 'Emergency Checklists' },
  { value: 'DOWNLOADS', label: 'Downloadable Resources' },
];

const categoryEmoji = {
  CONTACTS: '🆘',
  GUIDES: '📘',
  CHECKLISTS: '✅',
  DOWNLOADS: '📎',
};

const typeLabel = {
  PHONE: 'Phone',
  PDF: 'PDF',
  CHECKLIST: 'Checklist',
  GUIDE: 'Guide',
  DOCUMENT: 'Document',
};

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      setStatusMessage('');

      try {
        const data = await getResources();
        setResources(data);
      } catch {
        setStatusMessage('Unable to load emergency resources. Please refresh or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const titleMatch = resource.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = filterCategory ? resource.category === filterCategory : true;
      return titleMatch && categoryMatch;
    });
  }, [resources, searchQuery, filterCategory]);

  const getEmoji = (category) => categoryEmoji[category] || '🛡️';

  const getActionLabel = (resource) => {
    if (resource.category === 'DOWNLOADS') {
      return 'Download';
    }
    return 'View';
  };

  const getTypeLabel = (resourceType) => typeLabel[resourceType] || resourceType || 'Resource';

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">Emergency Resources Hub</p>
            <h1>Disaster Preparedness & Safety</h1>
            <p>Browse campus emergency contacts, preparedness guides, checklists, and ready-to-download safety resources.</p>
          </div>
        </section>

        <section className="modules-toolbar">
          <div className="search-field">
            <label htmlFor="resource-search">Search resources</label>
            <input
              id="resource-search"
              type="search"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="resource-category">Filter by category</label>
            <select
              id="resource-category"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isLoading && <p className="dashboard-status">Loading emergency resources...</p>}
        {statusMessage && <p className="dashboard-status error">{statusMessage}</p>}
        {!isLoading && !statusMessage && filteredResources.length === 0 && (
          <p className="dashboard-status">No resources match your search or filter. Please try another query.</p>
        )}

        <section className="modules-grid student-modules-grid" aria-label="Emergency resources list">
          {filteredResources.map((resource) => (
            <article className="module-card" key={resource.id}>
              <div className="module-card-header">
                <div className="module-card-title-row">
                  <span className="module-emoji">{getEmoji(resource.category)}</span>
                  <div>
                    <h2>{resource.title}</h2>
                    <p className="module-type">{resource.category}</p>
                  </div>
                </div>
              </div>

              <p>{resource.description}</p>

              <div className="resource-card-meta">
                <span>{getTypeLabel(resource.resourceType)}</span>
                {resource.linkOrContent && (
                  <span>{resource.linkOrContent}</span>
                )}
              </div>

              <div className="module-card-actions">
                <a
                  className="resource-action-button"
                  href={resource.linkOrContent || '#'}
                  target="_blank"
                  rel="noreferrer"
                  download={resource.category === 'DOWNLOADS'}
                >
                  {getActionLabel(resource)}
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export default ResourcesPage;

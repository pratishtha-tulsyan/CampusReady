import { useEffect, useMemo, useState } from 'react';
import ModuleCard from '../components/ModuleCard';
import Navbar from '../components/Navbar';
import { completeModule, getModules, getUserProgress } from '../services/api';


const disasterOptions = [
  { value: '', label: 'All Disaster Types' },
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

const statusOptions = [
  { value: 'all', label: 'All Modules' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
];

function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [modulesMessage, setModulesMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completionMessages, setCompletionMessages] = useState({});
  const [completingModuleId, setCompletingModuleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const completedModuleIds = useMemo(
    () => new Set(progress.filter((item) => item.completed).map((item) => item.moduleId)),
    [progress],
  );

  const completedModulesCount = completedModuleIds.size;
  const totalModules = modules.length;
  const progressPercentage = totalModules
    ? Math.round((completedModulesCount / totalModules) * 100)
    : 0;

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const titleMatch = module.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = filterType ? module.disasterType === filterType : true;
      const isCompleted = completedModuleIds.has(module.id);
      const statusMatch =
        filterStatus === 'all'
          ? true
          : filterStatus === 'completed'
          ? isCompleted
          : !isCompleted;

      return titleMatch && typeMatch && statusMatch;
    });
  }, [modules, searchQuery, filterType, filterStatus, completedModuleIds]);

  const getDisasterEmoji = (type) => disasterEmojiMap[type] || '🛡️';

  useEffect(() => {
    const fetchData = async () => {
      setModulesMessage('');
      setIsLoading(true);

      try {
        const [moduleData, progressData] = await Promise.all([
          getModules(),
          getUserProgress(),
        ]);

        setModules(moduleData);
        setProgress(progressData);
      } catch {
        setModulesMessage('Unable to load modules or progress. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleFilterTypeChange = (event) => setFilterType(event.target.value);
  const handleFilterStatusChange = (event) => setFilterStatus(event.target.value);

  const handleCompleteModule = async (moduleId) => {
    if (!moduleId) {
      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        unknown: 'Unable to complete this module because it is missing an id.',
      }));
      return;
    }

    if (completedModuleIds.has(moduleId)) {
      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        [moduleId]: 'Module has already been completed.',
      }));
      return;
    }

    setCompletingModuleId(moduleId);
    setCompletionMessages((currentMessages) => ({
      ...currentMessages,
      [moduleId]: '',
    }));

    try {
      const completed = await completeModule({
        moduleId,
        completed: true,
        completedAt: new Date().toISOString().slice(0, 19),
      });

      setProgress((currentProgress) => {
        const existingIndex = currentProgress.findIndex((item) => item.moduleId === moduleId);
        if (existingIndex >= 0) {
          return currentProgress.map((item) => (item.moduleId === moduleId ? completed : item));
        }
        return [...currentProgress, completed];
      });

      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        [moduleId]: 'Module completed successfully.',
      }));
    } catch {
      setCompletionMessages((currentMessages) => ({
        ...currentMessages,
        [moduleId]: 'Unable to complete module. Please try again.',
      }));
    } finally {
      setCompletingModuleId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="page-container">
          <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Training Modules</h1>
            <p>Review disaster readiness modules built for campus safety teams.</p>
          </div>
        </section>

        <section className="progress-summary student-progress-summary" aria-label="Learning progress summary">
          <article>
            <span>Total Modules</span>
            <strong>{totalModules}</strong>
          </article>
          <article>
            <span>Completed Modules</span>
            <strong>{completedModulesCount}</strong>
          </article>
          <article>
            <span>Completion Rate</span>
            <strong>{progressPercentage}%</strong>
          </article>
          <article className="progress-bar-container">
            <span className="progress-label">Overall progress</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
            </div>
          </article>
        </section>

        <section className="modules-toolbar">
          <div className="search-field">
            <label htmlFor="module-search">Search modules</label>
            <input
              id="module-search"
              type="search"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="filter-type">Filter by disaster type</label>
              <select id="filter-type" value={filterType} onChange={handleFilterTypeChange}>
                {disasterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-status">Filter by status</label>
              <select id="filter-status" value={filterStatus} onChange={handleFilterStatusChange}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isLoading && <p className="dashboard-status">Loading modules...</p>}
        {modulesMessage && <p className="dashboard-status error">{modulesMessage}</p>}

        {!isLoading && !modulesMessage && filteredModules.length === 0 && (
          <p className="dashboard-status">No modules match the search or filters.</p>
        )}

        <section className="modules-grid student-modules-grid" aria-label="CampusReady modules">
          {filteredModules.map((module, index) => (
            <ModuleCard
              key={module.id || module.title || index}
              module={module}
              disasterEmoji={getDisasterEmoji(module.disasterType)}
              isCompleted={completedModuleIds.has(module.id)}
              isCompleting={completingModuleId === module.id}
              completionMessage={completionMessages[module.id]}
              onComplete={handleCompleteModule}
            />
          ))}
        </section>
        </div>
      </main>
    </>
  );
}

export default ModulesPage;

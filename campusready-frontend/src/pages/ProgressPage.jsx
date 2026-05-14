import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getModules, getUserProgress } from '../services/api';

const DEFAULT_USER_ID = 1;

function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [moduleTitles, setModuleTitles] = useState({});
  const [totalModules, setTotalModules] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isProgressLoading, setIsProgressLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      setProgressMessage('');
      setIsProgressLoading(true);

      try {
        const [progressData, modulesData] = await Promise.all([
          getUserProgress(DEFAULT_USER_ID),
          getModules(),
        ]);
        const titlesById = modulesData.reduce((titles, module) => ({
          ...titles,
          [module.id]: module.title,
        }), {});

        setProgress(progressData);
        setModuleTitles(titlesById);
        setTotalModules(modulesData.length);
      } catch {
        setProgressMessage('Unable to load progress. Please try again later.');
      } finally {
        setIsProgressLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const completedModuleIds = new Set(
    progress
      .filter((item) => item.completed)
      .map((item) => item.moduleId),
  );
  const completedModulesCount = completedModuleIds.size;
  const progressPercentage = totalModules
    ? Math.round((completedModulesCount / totalModules) * 100)
    : 0;

  const formatCompletedAt = (completedAt) => {
    if (!completedAt) {
      return 'Not recorded';
    }

    return new Date(completedAt).toLocaleString();
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Progress</h1>
            <p>Track completed disaster readiness modules for your campus account.</p>
          </div>
        </section>

        <section className="progress-summary" aria-label="Progress summary">
          <article>
            <span>Completed Modules</span>
            <strong>{completedModulesCount}</strong>
          </article>
          <article>
            <span>Total Modules</span>
            <strong>{totalModules}</strong>
          </article>
          <article>
            <span>Overall Progress</span>
            <strong>{progressPercentage}%</strong>
          </article>
        </section>

        {isProgressLoading && <p className="dashboard-status">Loading progress...</p>}
        {progressMessage && <p className="dashboard-status error">{progressMessage}</p>}

        {!isProgressLoading && !progressMessage && progress.length === 0 && (
          <p className="dashboard-status">No progress records are available yet.</p>
        )}

        <section className="progress-grid" aria-label="CampusReady progress">
          {progress.map((item, index) => (
            <article className="progress-card" key={item.id || `${item.moduleId}-${index}`}>
              <div className="progress-card-header">
                <span className="module-type">
                  {moduleTitles[item.moduleId] || 'Unknown module'}
                </span>
                <span className={item.completed ? 'status-chip complete' : 'status-chip'}>
                  {item.completed ? 'Completed' : 'Incomplete'}
                </span>
              </div>

              <dl className="progress-details">
                <div>
                  <dt>Module Title</dt>
                  <dd>{moduleTitles[item.moduleId] || 'Unavailable'}</dd>
                </div>
                <div>
                  <dt>Completed Status</dt>
                  <dd>{item.completed ? 'Completed' : 'Not completed'}</dd>
                </div>
                <div>
                  <dt>Completed At</dt>
                  <dd>{formatCompletedAt(item.completedAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export default ProgressPage;

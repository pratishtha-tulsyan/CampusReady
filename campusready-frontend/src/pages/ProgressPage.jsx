import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getModules, getUserProgress, getMyBadges, getMyCertificate } from '../services/api';

function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [moduleTitles, setModuleTitles] = useState({});
  const [totalModules, setTotalModules] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [passedQuizzes, setPassedQuizzes] = useState(0);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [certificateEarned, setCertificateEarned] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      setProgressMessage('');
      setIsProgressLoading(true);
      setBadgeLoading(true);
      setLoadingCertificate(true);

      try {
        const [progressData, modulesData, badgeData, certificateData] = await Promise.all([
          getUserProgress(),
          getModules(),
          getMyBadges(),
          getMyCertificate(),
        ]);

        const titlesById = modulesData.reduce((titles, module) => ({
          ...titles,
          [module.id]: module.title,
        }), {});

        setProgress(progressData);
        setModuleTitles(titlesById);
        setTotalModules(modulesData.length);
        setBadges(badgeData.badges || []);
        setTotalPoints(badgeData.totalPoints || 0);
        setPassedQuizzes(badgeData.passedQuizzes || 0);
        setCertificateEarned(Boolean(certificateData));
      } catch {
        setProgressMessage('Unable to load progress. Please try again later.');
      } finally {
        setIsProgressLoading(false);
        setBadgeLoading(false);
        setLoadingCertificate(false);
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
        <div className="page-container">
          <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Progress</h1>
            <p>Track completed disaster readiness modules for your campus account.</p>
          </div>
        </section>

        <section className="certificate-summary" aria-label="Certificate status">
          <article>
            <span>Certificate Status</span>
            <strong>{loadingCertificate ? 'Checking...' : certificateEarned ? 'Earned ✅' : 'Locked'}</strong>
          </article>
          <article>
            <span>Certificate Page</span>
            <strong>
              <button type="button" className="secondary-button" onClick={() => navigate('/certificate')}>
                View Certificate
              </button>
            </strong>
          </article>
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
            <span>Total Points</span>
            <strong>{badgeLoading ? 'Loading...' : `${totalPoints} pts`}</strong>
          </article>
          <article>
            <span>Quiz Passes</span>
            <strong>{badgeLoading ? 'Loading...' : passedQuizzes}</strong>
          </article>
          <article>
            <span>Overall Progress</span>
            <strong>{progressPercentage}%</strong>
          </article>
        </section>

        <section className="badge-summary" aria-label="Achievement badges">
          <h2>Your badges</h2>
          <div className="badge-grid">
            {badgeLoading ? (
              <span>Loading badges...</span>
            ) : badges.length === 0 ? (
              <span className="badge-empty">Earn your first badge by completing a module.</span>
            ) : (
              badges.map((badge) => (
                <span key={badge} className="badge-chip">
                  {badge}
                </span>
              ))
            )}
          </div>
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
        </div>
      </main>
    </>
  );
}

export default ProgressPage;

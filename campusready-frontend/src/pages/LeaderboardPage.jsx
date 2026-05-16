import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getLeaderboard } from '../services/api';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getLeaderboard();
        setLeaderboard(Array.isArray(data) ? data : data.leaderboard || []);
      } catch {
        setError('Unable to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <div className="page-container">
          <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Leaderboard</h1>
            <p>See the top users with the most completed modules and quiz points.</p>
          </div>
        </section>

        {loading && <p className="dashboard-status">Loading leaderboard...</p>}
        {error && <p className="dashboard-status error">{error}</p>}

        {!loading && !error && (
          <section className="leaderboard-container" aria-label="Leaderboard rankings">
         <div className="leaderboard-table">
            <div className="leaderboard-row leaderboard-head">
              <span>Rank</span>
              <span>User</span>
              <span>Modules</span>
              <span>Quizzes</span>
              <span>Points</span>
            </div>
            {leaderboard.length === 0 ? (
              <p className="dashboard-status">No leaderboard data is available yet.</p>
            ) : (
              leaderboard.map((entry, index) => (
  <article className="leaderboard-row" key={entry.userId}>
    <span className="leaderboard-rank">
      #{index + 1}
    </span>

    <span>{entry.userName}</span>

    <span>{entry.completedModules}</span>

    <span>{entry.passedQuizzes}</span>

    <span className="leaderboard-points">
      {entry.totalPoints}
    </span>
  </article>
))
            )}
            </div>
          </section>
        )}
        </div>
      </main>
    </>
  );
}

export default LeaderboardPage;

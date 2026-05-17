import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { getAuthUser, saveAuthUser } from '../services/auth';
import bg from '../assets/lightning login bg.jpg';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (getAuthUser()) {
      navigate('/modules', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const { ok, token, message: loginMessage, email: returnedEmail, role } = await loginUser({ email, password });
      const loginSucceeded = ok && Boolean(token);

      if (!loginSucceeded) {
        setMessage(loginMessage || 'Invalid email or password.');
        return;
      }

      saveAuthUser({
        email: returnedEmail,
        token,
        message: loginMessage,
        role,
      });
      navigate('/modules', { replace: true });
    } catch {
      setMessage('Unable to connect to the backend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disasters = [
    { emoji: '🌍', title: 'Earthquake', desc: 'Learn how to secure yourself and respond quickly.' },
    { emoji: '🌊', title: 'Flood', desc: 'Understand flood risks and evacuation procedures.' },
    { emoji: '🔥', title: 'Fire', desc: 'Practice fire safety and prevention techniques.' },
    { emoji: '🌪️', title: 'Cyclone', desc: 'Prepare for high winds and shelter strategies.' },
    { emoji: '🌊', title: 'Tsunami', desc: 'Recognize warnings and safe evacuation routes.' },
    { emoji: '⛰️', title: 'Landslide', desc: 'Identify hazards and reduce exposure.' },
    { emoji: '☀️', title: 'Drought', desc: 'Learn water conservation and drought preparedness strategies.' },
    { emoji: '⛈️', title: 'Thunderstorm', desc: 'Understand lightning safety and severe weather precautions.' },
  ];

  return (
    <div className="landing-page">
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(3,12,23,0.55), rgba(3,12,23,0.45)), url('${bg}')`,
        }}
      >
        <div className="hero-inner">
          <div className="hero-left">
            <p className="eyebrow">CampusReady</p>
            <h1>Be Prepared. Be Safe. Be CampusReady.</h1>
            <p className="hero-sub">Campus safety learning platform — disaster readiness training, quizzes and preparedness education.</p>

            <ul className="feature-list" aria-hidden>
              <li><span className="feature-icon">📚</span><span className="feature-text">Learn</span></li>
              <li><span className="feature-icon">🛠️</span><span className="feature-text">Practice</span></li>
              <li><span className="feature-icon">⚠️</span><span className="feature-text">Prepare</span></li>
              <li><span className="feature-icon">🛡️</span><span className="feature-text">Protect</span></li>
            </ul>
          </div>

          <div className="hero-right">
            <form className="login-card glass" onSubmit={handleSubmit}>
              <div className="login-header">
                <h2>Welcome back</h2>
                <p>Sign in to access your training and progress</p>
              </div>

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.edu"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Login'}
              </button>

              {message && <p className="response-message">{message}</p>}
            </form>
          </div>
        </div>
      </header>

      <section className="disasters-section">
        <div className="section-inner">
          <h2>Disasters We Prepare For</h2>
          <p className="section-sub">Preparedness education for common campus disasters.</p>

          <div className="disaster-grid">
            {disasters.map((d) => (
              <article className="disaster-card" key={d.title}>
                <div className="disaster-emoji">{d.emoji}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;

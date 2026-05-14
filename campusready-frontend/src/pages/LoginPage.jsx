import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { getAuthUser, saveAuthUser } from '../services/auth';

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

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1>CampusReady</h1>
          <p>Sign in to continue</p>
        </div>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'}
        </button>

        {message && <p className="response-message">{message}</p>}
      </form>
    </div>
  );
}

export default LoginPage;

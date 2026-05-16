import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { clearAuthUser, isAdmin } from '../services/auth';
import { applyTheme, getSavedTheme, saveTheme, themes } from '../services/theme';

function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getSavedTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleLogout = () => {
    clearAuthUser();
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Primary navigation">
        <NavLink className="navbar-brand" to="/modules">
          CampusReady
        </NavLink>

        <div className="navbar-links">
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/modules"
          >
            Modules
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/progress"
          >
            Progress
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/leaderboard"
          >
            Leaderboard
          </NavLink>
          {isAdmin() && (
            <>
              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                to="/admin/modules"
              >
                Admin Modules
              </NavLink>
              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                to="/admin/users"
              >
                Users
              </NavLink>
            </>
          )}
          <button
            className="nav-link nav-button theme-toggle-button"
            type="button"
            onClick={() => {
              const nextTheme = theme === themes.dark ? themes.light : themes.dark;
              setTheme(nextTheme);
              saveTheme(nextTheme);
            }}
            aria-label={theme === themes.dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === themes.dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            className="nav-link nav-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

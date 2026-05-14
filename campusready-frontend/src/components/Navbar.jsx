import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuthUser, isAdmin } from '../services/auth';

function Navbar() {
  const navigate = useNavigate();

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
          {isAdmin() && (
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to="/admin/modules"
            >
              Admin
            </NavLink>
          )}
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

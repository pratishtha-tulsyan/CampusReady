import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createUser, deleteUser, getAdminUsers, updateUserRole } from '../services/api';

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'ADMIN', label: 'Admin' },
];

const initialFormState = {
  name: '',
  email: '',
  password: '',
  role: 'STUDENT',
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError('');

      try {
        const userList = await getAdminUsers();
        setUsers(userList);
      } catch {
        setError('Unable to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (!formState.name || !formState.email || !formState.password) {
      setError('Name, email, and password are required.');
      setIsSaving(false);
      return;
    }

    try {
      const user = await createUser(formState);
      setUsers((current) => [user, ...current]);
      setSuccess('User created successfully.');
      setFormState(initialFormState);
    } catch (err) {
      setError(err.message || 'Unable to create user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) {
      return;
    }

    setError('');
    setSuccess('');
    setDeletingId(userId);

    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setSuccess('User removed successfully.');
    } catch (err) {
      setError(err.message || 'Unable to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateUserRole(userId, role);
      setUsers((current) => current.map((user) => (user.id === userId ? updatedUser : user)));
      setSuccess('User role updated.');
    } catch (err) {
      setError(err.message || 'Unable to update role.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady Admin</p>
            <h1>User Management</h1>
            <p>View, add, and manage accounts for campus readiness participants and administrators.</p>
            <div className="admin-header-buttons">
              <button type="button" className="primary-button admin-nav-button" onClick={() => navigate('/admin/modules')}>
                Manage Modules
              </button>
              <button type="button" className="secondary-button admin-nav-button" onClick={() => navigate('/admin/quizzes')}>
                Manage Quizzes
              </button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-grid">
            <form className="admin-form-card" onSubmit={handleSubmit}>
              <div className="admin-form-header">
                <h2>Create New User</h2>
                <p className="admin-form-copy">Add a new participant or administrator account directly from the dashboard.</p>
              </div>

              {error && <p className="dashboard-status error">{error}</p>}
              {success && <p className="dashboard-status success">{success}</p>}

              <div className="admin-form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" value={formState.name} onChange={handleChange} required />
              </div>

              <div className="admin-form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formState.email} onChange={handleChange} required />
              </div>

              <div className="admin-form-field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={formState.password} onChange={handleChange} minLength={8} required />
              </div>

              <div className="admin-form-field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={formState.role} onChange={handleChange}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-actions">
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving user...' : 'Create user'}
                </button>
              </div>
            </form>

            <div className="admin-form-card admin-users-card">
              <div className="admin-form-header">
                <h2>Active Accounts</h2>
                <p className="admin-form-copy">Search and manage user roles and remove inactive accounts.</p>
              </div>

              {isLoading ? (
                <p className="subtle-text">Loading users...</p>
              ) : (
                <div className="admin-users-table-wrapper">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="subtle-text">
                            No users found yet.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <select
                                value={user.role}
                                onChange={(event) => handleRoleChange(user.id, event.target.value)}
                              >
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                              <button
                                type="button"
                                className="delete-button"
                                disabled={deletingId === user.id}
                                onClick={() => handleDelete(user.id)}
                              >
                                {deletingId === user.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default AdminUsersPage;

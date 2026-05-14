const AUTH_USER_KEY = 'campusReadyAuth';

export const saveAuthUser = ({ token, email, message, role }) => {
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({ token, email, message, role, savedAt: new Date().toISOString() }),
  );
};

export const getAuthUser = () => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedUser);

    if (!parsed?.token || !parsed?.email) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const getAuthToken = () => getAuthUser()?.token || null;
export const getAuthEmail = () => getAuthUser()?.email || null;
export const getAuthRole = () => getAuthUser()?.role || null;
export const isAuthenticated = () => Boolean(getAuthToken());
export const isAdmin = () => getAuthRole() === 'ADMIN';

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

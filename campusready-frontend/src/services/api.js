import { clearAuthUser, getAuthToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const authFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearAuthUser();
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    token: data.token || null,
    message: data.message || 'Login failed',
    email: data.email || email,
    role: data.role || null,
  };
};

export const getModules = async () => {
  const response = await fetch(`${API_BASE_URL}/modules/`);

  if (!response.ok) {
    throw new Error('Modules request failed');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.modules || [];
};

export const createModule = async (moduleData) => {
  const response = await authFetch('/modules/create', {
    method: 'POST',
    body: JSON.stringify(moduleData),
  });

  if (!response.ok) {
    throw new Error('Create module request failed');
  }

  return response.json();
};

export const completeModule = async ({ userId, moduleId, completed, completedAt }) => {
  const response = await authFetch('/progress/complete', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      moduleId,
      completed,
      completedAt,
    }),
  });

  if (!response.ok) {
    throw new Error('Completion request failed');
  }

  return response.json();
};

export const deleteModule = async (moduleId) => {
  const response = await authFetch(`/modules/${moduleId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Delete module request failed');
  }
};

export const getUserProgress = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/progress/user/${userId}`);

  if (!response.ok) {
    throw new Error('Progress request failed');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.progress || [];
};

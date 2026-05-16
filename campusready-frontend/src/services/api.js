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

export const completeModule = async ({ moduleId, completed, completedAt }) => {
  const response = await authFetch('/progress/complete', {
    method: 'POST',
    body: JSON.stringify({
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

export const updateModule = async (moduleId, moduleData) => {
  const response = await authFetch(`/modules/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(moduleData),
  });

  if (!response.ok) {
    throw new Error('Update module request failed');
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

export const getUserProgress = async () => {
  const response = await authFetch('/progress/my');

  if (!response.ok) {
    throw new Error('Progress request failed');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.progress || [];
};

// Quiz API functions
export const getQuizByModule = async (moduleId) => {
  const response = await authFetch(`/quiz/module/${moduleId}`);

  if (!response.ok) {
    throw new Error('Quiz not found for module');
  }

  return response.json();
};

export const getQuizQuestions = async (quizId) => {
  const response = await authFetch(`/quiz/${quizId}/questions`);

  if (!response.ok) {
    throw new Error('Failed to fetch quiz questions');
  }

  return response.json();
};

export const submitQuiz = async (quizId, answers) => {
  const response = await authFetch('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({
      quizId,
      answers,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit quiz');
  }

  return response.json();
};

export const checkIfQuizPassed = async (quizId) => {
  const response = await authFetch(`/quiz/${quizId}/passed`);

  if (!response.ok) {
    throw new Error('Failed to check quiz status');
  }

  return response.json();
};

export const getQuizHistory = async (quizId) => {
  const response = await authFetch(`/quiz/${quizId}/history`);

  if (!response.ok) {
    throw new Error('Failed to fetch quiz history');
  }

  return response.json();
};

export const getLeaderboard = async () => {
  const response = await authFetch('/leaderboard');

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
};

export const getMyBadges = async () => {
  const response = await authFetch('/leaderboard/my');

  if (!response.ok) {
    throw new Error('Failed to fetch badges');
  }

  return response.json();
};

// Admin quiz functions
export const createQuiz = async (quizData) => {
  const response = await authFetch('/quiz/create', {
    method: 'POST',
    body: JSON.stringify(quizData),
  });

  if (!response.ok) {
    throw new Error('Failed to create quiz');
  }

  return response.json();
};

export const addQuestionToQuiz = async (quizId, questionData) => {
  const response = await authFetch(`/quiz/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(questionData),
  });

  if (!response.ok) {
    throw new Error('Failed to add question to quiz');
  }

  return response.json();
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await authFetch(`/quiz/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify(quizData),
  });

  if (!response.ok) {
    throw new Error('Failed to update quiz');
  }

  return response.json();
};

export const deleteQuestion = async (questionId) => {
  const response = await authFetch(`/quiz/questions/${questionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete question');
  }
};

export const deleteQuiz = async (quizId) => {
  const response = await authFetch(`/quiz/${quizId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete quiz');
  }
};

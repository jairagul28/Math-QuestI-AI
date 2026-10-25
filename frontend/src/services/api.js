import axios from 'axios';

const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('mq_token');
        localStorage.removeItem('mq_user');
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const topicsAPI = {
  getTopics: (params) => api.get('/topics', { params }),
  getTopicById: (id) => api.get(`/topics/${id}`),
};

export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getAvatarRewards: () => api.get('/users/avatars'),
  equipAvatar: (data) => api.put('/users/avatar', data),
  getLeaderboardSettings: () => api.get('/users/leaderboard/settings'),
  updateLeaderboardSettings: (data) => api.put('/users/leaderboard/settings', data),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
};

export const challengesAPI = {
  getDaily: () => api.get('/challenges/daily', {
    params: { timeZone: getBrowserTimeZone() },
  }),
  submitAnswer: (challengeCode, data) => api.post(`/challenges/daily/${challengeCode}/answer`, {
    ...data,
    timeZone: getBrowserTimeZone(),
  }),
};

export const aiAPI = {
  generateLesson: (data) => api.post('/ai/generate-lesson', data),
  completeLesson: (data) => api.post('/ai/complete-lesson', {
    ...data,
    timeZone: getBrowserTimeZone(),
  }),
};

export const quizzesAPI = {
  generateQuiz: (data) => api.post('/quizzes/generate', data),
  startQuiz: (data) => api.post('/quizzes/start', data),
  submitAnswer: (attemptId, data) => api.post(`/quizzes/${attemptId}/answer`, {
    ...data,
    timeZone: getBrowserTimeZone(),
  }),
  getQuizResult: (attemptId) => api.get(`/quizzes/${attemptId}/result`),
  getHistory: () => api.get('/quizzes/history'),
};

export default api;

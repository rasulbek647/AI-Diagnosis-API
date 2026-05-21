// axios.js — Configured Axios instance with automatic token refresh
import axios from 'axios';

const isDemo = import.meta.env.VITE_DEMO === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export function clearAuthStorage() {
  localStorage.removeItem('medai_token');
  localStorage.removeItem('medai_refresh_token');
}

export function saveAuthTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem('medai_token', access_token);
  if (refresh_token) localStorage.setItem('medai_refresh_token', refresh_token);
}

function redirectToLogin() {
  clearAuthStorage();
  if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
    window.location.href = '/login';
  }
}

let isRefreshing = false;
let refreshQueue = [];

function drainQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem('medai_lang') || 'uz';
    config.headers['Accept-Language'] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (isDemo || status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/refresh');

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('medai_refresh_token');
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      saveAuthTokens(data);
      drainQueue(null, data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

import axios from 'axios';
import { getMockResponse } from './mockData';

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isDev ? 'http://localhost:3001/api' : 'https://webnongsan.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isDev ? 10000 : 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - fallback to mock data when backend is unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const isDemoToken = localStorage.getItem('token')?.startsWith('demo-token');

    // If backend is unreachable OR using demo token, return mock data
    if (isNetworkError || isDemoToken) {
      const url = error.config?.url || '';
      const method = error.config?.method?.toUpperCase() || 'GET';

      // Allow POST/PUT/DELETE to silently succeed in demo mode
      if (method !== 'GET') {
        return Promise.resolve({ data: { success: true, message: 'Demo mode' } });
      }

      const mockData = getMockResponse(url, method);
      if (mockData !== null) {
        return Promise.resolve({ data: mockData });
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

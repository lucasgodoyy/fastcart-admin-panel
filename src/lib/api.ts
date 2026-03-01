import axios from 'axios';
import { redirectToLogin } from '@/lib/session';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API Error] Token expired/invalid:', error.config?.url);
      redirectToLogin();
    }
    if (error.response?.status === 403) {
      console.warn('[API Warning] Forbidden (no permission):', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

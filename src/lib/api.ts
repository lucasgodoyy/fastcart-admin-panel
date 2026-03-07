import axios from 'axios';
import { redirectToLogin } from '@/lib/session';

function resolveApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (configuredUrl && configuredUrl.trim()) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api/v1';
    }

    if (hostname.includes('rapidocart.com.br')) {
      return 'https://api.rapidocart.com.br/api/v1';
    }

    if (hostname.includes('lojaki.store')) {
      return 'https://api.lojaki.store/api/v1';
    }
  }

  return 'http://localhost:8080/api/v1';
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
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

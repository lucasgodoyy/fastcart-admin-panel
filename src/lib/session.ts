import Cookies from 'js-cookie';

const STORAGE_KEYS = ['token', 'email', 'role', 'storeId', 'userId'];

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  Cookies.remove('token', { path: '/' });
  Cookies.remove('role', { path: '/' });
}

export function redirectToLogin() {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
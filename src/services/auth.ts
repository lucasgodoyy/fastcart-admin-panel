import apiClient from '@/lib/api';
import { LoginCredentials, AuthResponse, ResetPasswordRequest } from '@/types/auth';
import { normalizeRole } from '@/lib/auth-role';
import { redirectToLogin } from '@/lib/session';
import Cookies from 'js-cookie';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, email, role, storeId } = response.data;
    const normalizedRole = normalizeRole(role);

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email || credentials.email);
      if (normalizedRole) localStorage.setItem('role', normalizedRole);
      if (storeId) localStorage.setItem('storeId', storeId.toString());

      Cookies.set('token', token, {
        expires: 7,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      if (normalizedRole) {
        Cookies.set('role', normalizedRole, {
          expires: 7,
          path: '/',
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
      }
    }

    return {
      ...response.data,
      role: normalizedRole,
    };
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', payload);
  },

  logout: (): void => {
    redirectToLogin();
  },
};

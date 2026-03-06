import apiClient from '@/lib/api';
import { LoginCredentials, AuthResponse, ResetPasswordRequest } from '@/types/auth';
import { normalizeRole } from '@/lib/auth-role';
import { redirectToLogin } from '@/lib/session';
import Cookies from 'js-cookie';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, email, role, storeId, emailVerified } = response.data;
    const normalizedRole = normalizeRole(role);

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email || credentials.email);
      if (normalizedRole) localStorage.setItem('role', normalizedRole);
      if (storeId) localStorage.setItem('storeId', storeId.toString());
      localStorage.setItem('emailVerified', emailVerified ? 'true' : 'false');

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

  register: async (payload: { email: string; password: string; storeName: string }): Promise<void> => {
    await apiClient.post('/users/register', payload);
  },

  verifyEmail: async (token: string): Promise<{ status: string; email: string }> => {
    const response = await apiClient.get<{ status: string; email: string }>('/auth/verify-email', {
      params: { token },
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email });
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', payload);
  },

  logout: (): void => {
    redirectToLogin();
  },
};

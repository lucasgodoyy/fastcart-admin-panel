import apiClient from '@/lib/api';
import { LoginCredentials, AuthResponse, RequestPasswordResetPayload, ResetPasswordRequest } from '@/types/auth';
import { normalizeRole } from '@/lib/auth-role';
import { redirectToLogin } from '@/lib/session';
import Cookies from 'js-cookie';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, email, role, userId, storeId, emailVerified } = response.data;
    const normalizedRole = normalizeRole(role);

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email || credentials.email);
      if (normalizedRole) localStorage.setItem('role', normalizedRole);
      if (userId) localStorage.setItem('userId', userId.toString());
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

  oauthLogin: async (provider: string, idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/oauth', { provider, idToken });
    const { token, email, role, userId, storeId, emailVerified } = response.data;
    const normalizedRole = normalizeRole(role);

    if (token) {
      localStorage.setItem('token', token);
      if (email) localStorage.setItem('email', email);
      if (normalizedRole) localStorage.setItem('role', normalizedRole);
      if (userId) localStorage.setItem('userId', userId.toString());
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

    return { ...response.data, role: normalizedRole };
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

  requestPasswordReset: async (payload: RequestPasswordResetPayload): Promise<void> => {
    await apiClient.post('/auth/reset-password/request', payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', payload);
  },

  logout: (): void => {
    redirectToLogin();
  },
};

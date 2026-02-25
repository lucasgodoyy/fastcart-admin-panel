'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginCredentials, AuthContextType, User } from '@/types/auth';
import { authService } from '@/services/auth';
import { normalizeRole } from '@/lib/auth-role';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    const storedToken = cookieToken || localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const normalizedRole = normalizeRole(localStorage.getItem('role'));
      const storeIdStr = localStorage.getItem('storeId');

      setUser({
        id: localStorage.getItem('userId') || 'temp-id',
        email: localStorage.getItem('email') || '',
        role: normalizedRole,
        storeId: storeIdStr ? parseInt(storeIdStr) : undefined,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);

      const storeIdStr = response.storeId?.toString();
      setUser({
        id: 'temp-id',
        email: response.email || credentials.email,
        role: normalizeRole(response.role),
        storeId: response.storeId,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

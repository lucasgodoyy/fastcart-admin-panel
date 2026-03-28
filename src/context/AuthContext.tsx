'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginCredentials, AuthContextType, User, AuthResponse } from '@/types/auth';
import { authService } from '@/services/auth';
import { normalizeRole } from '@/lib/auth-role';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

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
      const verified = localStorage.getItem('emailVerified') === 'true';

      setEmailVerified(verified);
      setUser({
        id: localStorage.getItem('userId') || 'temp-id',
        email: localStorage.getItem('email') || '',
        role: normalizedRole,
        storeId: storeIdStr ? parseInt(storeIdStr) : undefined,
        emailVerified: verified,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);

      const verified = response.emailVerified ?? false;
      setEmailVerified(verified);

      setUser({
        id: response.userId?.toString() || localStorage.getItem('userId') || credentials.email,
        email: response.email || credentials.email,
        role: normalizeRole(response.role),
        storeId: response.storeId,
        emailVerified: verified,
      });
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEmailVerified = (verified: boolean) => {
    setEmailVerified(verified);
    localStorage.setItem('emailVerified', verified ? 'true' : 'false');
    if (user) {
      setUser({ ...user, emailVerified: verified });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmailVerified(false);
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        emailVerified,
        login,
        logout,
        setEmailVerified: handleSetEmailVerified,
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

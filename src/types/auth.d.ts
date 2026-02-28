export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  role?: string;
  storeId?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
  storeId?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
}

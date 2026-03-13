export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  role?: string;
  storeId?: number;
  emailVerified?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
  storeId?: number;
  emailVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  setEmailVerified: (verified: boolean) => void;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
  expiresAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Initial auth state
export const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

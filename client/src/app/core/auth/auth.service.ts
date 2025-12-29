import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay, tap } from 'rxjs';
import {
  User,
  LoginCredentials,
  AuthResult,
  AuthState,
  INITIAL_AUTH_STATE,
} from '../../shared/models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Mock users for development (until backend auth is implemented)
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@astro.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@astro.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
  'user@astro.com': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@astro.com',
      name: 'Regular User',
      role: 'user',
    },
  },
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _authState = signal<AuthState>(this.loadStoredAuthState());

  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly currentUser = computed(() => this._authState().user);
  readonly token = computed(() => this._authState().token);

  constructor(private router: Router) {}

  /**
   * Attempt to log in with the provided credentials
   * Currently uses mock authentication - will be replaced with GraphQL mutation
   */
  login(credentials: LoginCredentials): Observable<AuthResult> {
    // Mock authentication logic
    const mockUser = MOCK_USERS[credentials.email.toLowerCase()];

    if (mockUser && mockUser.password === credentials.password) {
      const result: AuthResult = {
        token: this.generateMockToken(),
        user: mockUser.user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      return of(result).pipe(
        delay(500), // Simulate network delay
        tap((authResult) => this.handleAuthSuccess(authResult))
      );
    }

    // Simulate failed login
    return new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.error(new Error('Invalid email or password'));
      }, 500);
    });
  }

  /**
   * Log out the current user
   */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Check if the user is currently authenticated
   */
  checkAuthenticated(): boolean {
    const state = this._authState();
    return state.isAuthenticated && !!state.token;
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return this._authState().token;
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(result: AuthResult): void {
    const newState: AuthState = {
      isAuthenticated: true,
      user: result.user,
      token: result.token,
    };

    this._authState.set(newState);
    this.saveAuthState(newState);
  }

  /**
   * Load auth state from sessionStorage
   */
  private loadStoredAuthState(): AuthState {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const userJson = sessionStorage.getItem(USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        return {
          isAuthenticated: true,
          user,
          token,
        };
      }
    } catch (error) {
      console.error('Error loading auth state from storage:', error);
      this.clearStorage();
    }

    return INITIAL_AUTH_STATE;
  }

  /**
   * Save auth state to sessionStorage
   */
  private saveAuthState(state: AuthState): void {
    if (state.token && state.user) {
      sessionStorage.setItem(TOKEN_KEY, state.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(state.user));
    }
  }

  /**
   * Clear auth state from memory and storage
   */
  private clearAuthState(): void {
    this._authState.set(INITIAL_AUTH_STATE);
    this.clearStorage();
  }

  /**
   * Clear sessionStorage
   */
  private clearStorage(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  /**
   * Generate a mock JWT token for development
   */
  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: '1',
        email: 'admin@astro.com',
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    );
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}

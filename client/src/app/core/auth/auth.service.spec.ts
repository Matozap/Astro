import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
      ],
    });

    // Clear sessionStorage before each test
    sessionStorage.clear();

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have isAuthenticated as false initially', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should have currentUser as null initially', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should have token as null initially', () => {
      expect(service.token()).toBeNull();
    });
  });

  describe('login', () => {
    it('should authenticate with valid credentials', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: (result) => {
          expect(result).toBeTruthy();
          expect(result.token).toBeTruthy();
          expect(result.user).toBeTruthy();
          expect(result.user.email).toBe('admin@astro.com');
          expect(service.isAuthenticated()).toBeTrue();
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });

    it('should fail with invalid credentials', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'wrongpassword' };

      service.login(credentials).subscribe({
        next: () => {
          fail('Login should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Invalid email or password');
          expect(service.isAuthenticated()).toBeFalse();
          done();
        },
      });
    });

    it('should store token in sessionStorage after successful login', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: () => {
          expect(sessionStorage.getItem('auth_token')).toBeTruthy();
          expect(sessionStorage.getItem('auth_user')).toBeTruthy();
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.isAuthenticated()).toBeTrue();

          service.logout();

          expect(service.isAuthenticated()).toBeFalse();
          expect(service.currentUser()).toBeNull();
          expect(service.token()).toBeNull();
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });

    it('should clear sessionStorage on logout', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: () => {
          service.logout();

          expect(sessionStorage.getItem('auth_token')).toBeNull();
          expect(sessionStorage.getItem('auth_user')).toBeNull();
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });

    it('should navigate to login page on logout', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: () => {
          service.logout();

          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });
  });

  describe('checkAuthenticated', () => {
    it('should return false when not authenticated', () => {
      expect(service.checkAuthenticated()).toBeFalse();
    });

    it('should return true when authenticated', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: () => {
          expect(service.checkAuthenticated()).toBeTrue();
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });
  });

  describe('getToken', () => {
    it('should return null when not authenticated', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token when authenticated', (done) => {
      const credentials = { email: 'admin@astro.com', password: 'admin123' };

      service.login(credentials).subscribe({
        next: (result) => {
          expect(service.getToken()).toBe(result.token);
          done();
        },
        error: () => {
          fail('Login should have succeeded');
          done();
        },
      });
    });
  });
});

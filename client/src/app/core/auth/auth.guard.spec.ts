import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, noAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Auth Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  describe('authGuard', () => {
    it('should allow access when user is authenticated', () => {
      authServiceSpy.checkAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to login when user is not authenticated', () => {
      authServiceSpy.checkAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
    });

    it('should pass the attempted URL as returnUrl query param', () => {
      authServiceSpy.checkAuthenticated.and.returnValue(false);
      const customState = { url: '/products' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, customState)
      );

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/products' },
      });
    });
  });

  describe('noAuthGuard', () => {
    it('should allow access when user is not authenticated', () => {
      authServiceSpy.checkAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        noAuthGuard(mockRoute, mockState)
      );

      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to dashboard when user is authenticated', () => {
      authServiceSpy.checkAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        noAuthGuard(mockRoute, mockState)
      );

      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});

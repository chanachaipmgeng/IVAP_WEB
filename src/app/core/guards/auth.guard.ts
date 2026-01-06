import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  router.navigate(['/portal/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/portal/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user is super admin (admin_system or has super_admin role)
  if (authService.isSuperAdmin() || authService.isAdminSystem()) {
    return true;
  }

  // If not super admin, redirect to portal dashboard
  router.navigate(['/portal/dashboard']);
  return false;
};

export const companyAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isCompanyAdmin()) {
    return true;
  }

  router.navigate(['/portal/login']);
  return false;
};


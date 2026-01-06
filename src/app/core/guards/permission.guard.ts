import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        router.navigate(['/portal/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    // Get required permission from route data
    const requiredPermission = route.data['permission'] as string;

    // If no permission is required, allow access (or should we block? Safest to allow if not specified, but warn)
    if (!requiredPermission) {
        console.warn('PermissionGuard used but no permission specified in route data');
        return true;
    }

    // Check if user has the required permission
    if (authService.hasPermission(requiredPermission)) {
        return true;
    }

    // If user is super admin, they might bypass (depending on policy, but usually explicit permission check is better)
    // However, AuthService.isSuperAdmin() usually implies full access. 
    // Let's check if isSuperAdmin() is true, if so allow.
    if (authService.isSuperAdmin() || authService.isAdminSystem()) {
        return true;
    }

    // Redirect to dashboard or show unauthorized
    // For now, redirect to dashboard
    router.navigate(['/portal/dashboard']);
    return false;
};

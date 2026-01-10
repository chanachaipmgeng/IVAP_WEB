import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;  // snake_case (from backend)
  accessToken?: string;   // camelCase (after ApiService transformation)
  token_type?: string;
  tokenType?: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.setCurrentUser(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  /**
   * Normalize user data from API response
   * Ensures all required fields are present and supports both snake_case and camelCase
   */
  private normalizeUser(rawUser: any): User {
    // Ensure required fields from Member interface
    const memberId = rawUser.memberId || rawUser.member_id || rawUser.id || '';
    const username = rawUser.username || '';
    const email = rawUser.email || '';
    const firstName = rawUser.firstName || rawUser.first_name || '';
    const lastName = rawUser.lastName || rawUser.last_name || '';
    const actorType = rawUser.actorType || rawUser.actor_type || 'member';
    const isActive = rawUser.isActive !== undefined ? rawUser.isActive : (rawUser.is_active !== undefined ? rawUser.is_active : true);
    const isVerified = rawUser.isVerified !== undefined ? rawUser.isVerified : (rawUser.is_verified !== undefined ? rawUser.is_verified : false);
    const status = rawUser.status || 'enable';
    const roles = rawUser.roles || [];
    const permissions = rawUser.permissions || [];

    // Extract company info from user_metadata if available
    const userMetadata = rawUser.user_metadata || rawUser.userMetadata || {};
    const companyIdFromMetadata = userMetadata.company_id || userMetadata.companyId;
    const companyNameFromMetadata = userMetadata.company_name || userMetadata.companyName;

    const normalizedUser = {
      // Required fields from Member
      memberId,
      member_id: rawUser.member_id || memberId,
      username,
      email,
      first_name: rawUser.first_name || firstName,
      last_name: rawUser.last_name || lastName,
      actor_type: rawUser.actor_type || actorType,
      is_active: rawUser.is_active !== undefined ? rawUser.is_active : isActive,
      status,
      roles,
      permissions,
      // Optional fields from Member
      phone_number: rawUser.phone_number || rawUser.phoneNumber,
      member_type: rawUser.member_type || rawUser.memberType,
      picture: rawUser.picture,
      user_metadata: userMetadata,
      last_login_at: rawUser.last_login_at || rawUser.lastLoginAt,
      created_at: rawUser.created_at || rawUser.createdAt || new Date().toISOString(),
      updated_at: rawUser.updated_at || rawUser.updatedAt || new Date().toISOString(),
      is_verified: rawUser.is_verified !== undefined ? rawUser.is_verified : isVerified,

      // Compatibility fields
      id: rawUser.id || memberId,

      // Additional fields
      companyId: rawUser.companyId || rawUser.company_id || companyIdFromMetadata,
      company_id: rawUser.company_id || rawUser.companyId || companyIdFromMetadata,
      companyName: rawUser.companyName || companyNameFromMetadata,
      fullName: rawUser.fullName || `${firstName} ${lastName}`.trim(),
      password: rawUser.password // For form data
    };

    return normalizedUser;
  }

  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Send JSON credentials to login endpoint
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        // ApiService transforms snake_case to camelCase, so access_token becomes accessToken
        // Support both formats for compatibility
        const token = (response as any).accessToken || (response as any).access_token;

        if (!token) {
          console.error('Login response missing access_token:', response);
          throw new Error('Invalid login response: missing access token');
        }

        // Normalize user data - support both camelCase (from ApiService) and snake_case
        const user = this.normalizeUser(response.user);

        this.setToken(token);
        this.setCurrentUser(user);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/portal/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  public hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }

  public hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }

  public isSuperAdmin(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Check by actor_type (snake_case only)
    const actorType = user.actor_type;
    if (actorType === 'admin_system') {
      return true;
    }
    return this.hasRole('super_admin');
  }

  public isAdminSystem(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Use snake_case only
    const actorType = user.actor_type;
    return actorType === 'admin_system';
  }

  public isCompanyAdmin(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Use snake_case only
    const memberType = user.member_type;
    const actorType = user.actor_type;

    if (memberType === 'admin' || actorType === 'member') {
      return true;
    }
    return this.hasRole('company_admin') || this.hasRole('admin');
  }

  public isMember(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const actorType = user.actor_type;  // snake_case only
    return actorType === 'member';
  }

  public isGuest(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const actorType = user.actor_type;  // snake_case only
    return actorType === 'guest';
  }

  /**
   * Get redirect path based on user role/type
   */
  public getRedirectPath(): string {
    const user = this.currentUser();
    if (!user) return '/portal/login';

    // Use snake_case only
    const actorType = user.actor_type;
    const memberType = user.member_type;

    // Admin System (Super Admin)
    if (actorType === 'admin_system' || this.isSuperAdmin()) {
      return '/super';
    }

    // Company Admin
    if (actorType === 'member' && (memberType === 'admin' || this.isCompanyAdmin())) {
      return '/portal/dashboard';
    }

    // Regular Member/Employee
    if (actorType === 'member') {
      return '/portal/dashboard';
    }

    // Guest
    if (actorType === 'guest') {
      return '/portal/dashboard';
    }

    // Default
    return '/portal/dashboard';
  }

  /**
   * Get current user (alias for the signal)
   */
  public getCurrentUser(): User | null {
    return this.currentUser();
  }

  // --- Registration ---

  public register(data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    actor_type: string;
    member_type?: string;
    phone_number?: string;
  }): Observable<User> {
    return this.api.post<User>('/auth/register', data).pipe(
      tap(user => {
        // Normalize user data after registration
        const normalizedUser = this.normalizeUser(user);
        // Note: Registration doesn't automatically log in the user
        // User needs to login separately after registration
      })
    );
  }

  // --- Get Current User Info from Server ---

  /**
   * Fetch current user information from server
   * Useful for refreshing user data or getting latest information
   */
  public getCurrentUserInfo(): Observable<User> {
    return this.api.get<User>('/auth/me').pipe(
      tap(user => {
        // Normalize user data
        const normalizedUser = this.normalizeUser(user);
        this.setCurrentUser(normalizedUser);
      })
    );
  }

  // --- Password Reset Flow ---

  /**
   * Request password reset link
   * Sends a password reset link to the user's email
   */
  public forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
  }

  /**
   * Reset password using token from email
   * @param token - Password reset token received via email
   * @param newPassword - New password
   */
  public resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      new_password: newPassword
    });
  }
}


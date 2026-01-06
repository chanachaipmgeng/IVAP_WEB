/**
 * Door Service
 * 
 * Service for managing doors and door permissions
 * Matches backend door routes
 */

import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { handleApiResponse, PaginatedApiResponse } from '../utils/response-handler';
import {
  Door,
  DoorCreate,
  DoorUpdate,
  DoorResponse,
  DoorPermission,
  DoorPermissionCreate,
  DoorPermissionResponse,
  DoorFilters,
  DoorStatistics
} from '../models/door.model';

@Injectable({
  providedIn: 'root'
})
export class DoorService extends BaseCrudService<Door, DoorCreate, DoorUpdate> {
  protected baseEndpoint = '/doors';
  private auth = inject(AuthService);

  // Signal-based state management
  private doors = signal<Door[]>([]);
  private loading = signal(false);

  constructor(protected override api: ApiService) {
    super(api);
  }

  // Getters
  getDoors = () => this.doors.asReadonly();
  getLoading = () => this.loading.asReadonly();

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    const companyId = user.companyId || (user as any).company_id;
    if (!companyId) {
      throw new Error('User is not associated with a company');
    }
    return companyId.toString();
  }

  /**
   * Load all doors for current company
   */
  loadDoors(): Observable<Door[]> {
    this.loading.set(true);
    try {
      const companyId = this.getCompanyId();
      return this.getByCompanyId(companyId).pipe(
        tap((doors) => {
          this.doors.set(doors);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Error loading doors:', error);
          this.doors.set([]);
          this.loading.set(false);
          throw error;
        })
      );
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  /**
   * Get all doors for a company
   */
  getByCompanyId(companyId: string): Observable<Door[]> {
    return this.api.get<Door[]>(`${this.baseEndpoint}/company/${companyId}/doors`).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Get door by ID (company-scoped)
   */
  getByIdWithCompany(companyId: string, doorId: string): Observable<Door> {
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/doors/${doorId}`).pipe(
      map(response => handleApiResponse<Door>(response))
    );
  }

  /**
   * Create new door (company-scoped)
   */
  createWithCompany(companyId: string, data: DoorCreate): Observable<Door> {
    return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}/doors`, data).pipe(
      map(response => handleApiResponse<Door>(response)),
      tap((door) => {
        // Update local state
        this.doors.update(doors => [...doors, door]);
      })
    );
  }

  /**
   * Create door for current company
   */
  createDoor(data: Partial<DoorCreate>): Observable<Door> {
    const companyId = this.getCompanyId();
    const doorData: DoorCreate = {
      doorName: data.doorName || '',
      location: data.location
    };
    return this.createWithCompany(companyId, doorData);
  }

  /**
   * Update existing door (company-scoped)
   */
  updateWithCompany(companyId: string, doorId: string, data: DoorUpdate): Observable<Door> {
    return this.api.put<any>(`${this.baseEndpoint}/company/${companyId}/doors/${doorId}`, data).pipe(
      map(response => handleApiResponse<Door>(response)),
      tap((door) => {
        // Update local state
        this.doors.update(doors => doors.map(d => d.id === door.id ? door : d));
      })
    );
  }

  /**
   * Update door for current company
   */
  updateDoor(doorId: string, data: Partial<DoorUpdate>): Observable<Door> {
    const companyId = this.getCompanyId();
    return this.updateWithCompany(companyId, doorId, data);
  }

  /**
   * Delete door (company-scoped)
   */
  deleteWithCompany(companyId: string, doorId: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/doors/${doorId}`).pipe(
      tap(() => {
        // Update local state
        this.doors.update(doors => doors.filter(d => d.id !== doorId));
      })
    );
  }

  /**
   * Delete door for current company
   */
  deleteDoor(doorId: string): Observable<void> {
    const companyId = this.getCompanyId();
    return this.deleteWithCompany(companyId, doorId);
  }

  /**
   * Get door by ID for current company
   */
  getDoorById(doorId: string): Observable<Door> {
    const companyId = this.getCompanyId();
    return this.getByIdWithCompany(companyId, doorId);
  }

  /**
   * Grant door permission to employee
   * Backend: POST /api/v1/doors/company/{company_id}/doors/permissions
   */
  grantPermission(companyId: string, data: DoorPermissionCreate): Observable<DoorPermission> {
    return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}/doors/permissions`, data).pipe(
      map(response => handleApiResponse<DoorPermission>(response))
    );
  }

  /**
   * Revoke door permission
   * Backend: DELETE /api/v1/doors/company/{company_id}/doors/permissions/{permission_id}
   */
  revokePermission(companyId: string, permissionId: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/doors/permissions/${permissionId}`);
  }

  /**
   * Get permissions for a door
   * Backend: GET /api/v1/doors/company/{company_id}/doors/{door_id}/permissions
   */
  getDoorPermissions(companyId: string, doorId: string): Observable<DoorPermission[]> {
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/doors/${doorId}/permissions`).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Get door statistics
   */
  getStatistics(companyId?: string): Observable<DoorStatistics> {
    const params = companyId ? { companyId } : {};
    return this.api.get<DoorStatistics>(`${this.baseEndpoint}/statistics`, params).pipe(
      map(response => handleApiResponse<DoorStatistics>(response))
    );
  }
}

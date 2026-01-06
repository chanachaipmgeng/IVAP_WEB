import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
  VehicleCheckIn,
  VehicleCheckOut,
  VehicleStats,
  ParkingSpot,
  ParkingSpotAssignment
} from '../models/vehicle.model';
import { PaginatedResponse } from '../models/base.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class VehicleService extends BaseCrudService<Vehicle, VehicleCreate, VehicleUpdate> {
  protected baseEndpoint = '/vehicles';

  constructor(
    protected override api: ApiService,
    private auth: AuthService
  ) {
    super(api);
  }

  /**
   * Get current company ID from auth
   */
  private getCompanyId(): string {
    const companyId = this.auth.currentUser()?.companyId || (this.auth.currentUser() as any)?.company_id;
    if (!companyId) {
      throw new Error('Company ID not found. User must be logged in.');
    }
    return typeof companyId === 'number' ? companyId.toString() : companyId;
  }

  // ==================== Vehicle CRUD (Override BaseCrudService) ====================

  /**
   * Get all vehicles with filters and pagination
   * Override to use company-specific endpoint
   */
  override getAll(filters?: any): Observable<PaginatedApiResponse<Vehicle>> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters, options).pipe(
        map((response: any) => {
          const items = response.items || response.data || [];
          return {
            total: response.total || items.length,
            data: items,
            items: items,
            page: response.page || 1,
            size: response.size || response.page_size || items.length
          } as PaginatedApiResponse<Vehicle>;
        }),
        catchError((error) => {
          console.error('Error loading vehicles:', error);
          return of({
            data: [],
            items: [],
            total: 0,
            page: 1,
            size: 10
          } as PaginatedApiResponse<Vehicle>);
        })
      );
    } catch (error) {
      return of({
        data: [],
        items: [],
        total: 0,
        page: 1,
        size: 10
      } as PaginatedApiResponse<Vehicle>);
    }
  }

  /**
   * Get vehicles (alias for getAll)
   */
  getVehicles(params?: any): Observable<PaginatedApiResponse<Vehicle>> {
    return this.getAll(params);
  }

  /**
   * Get vehicle by ID
   * Override to use company-specific endpoint
   */
  override getById(id: string): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/${id}`, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get vehicle by ID (alias)
   */
  getVehicleById(id: string): Observable<Vehicle> {
    return this.getById(id);
  }

  /**
   * Create new vehicle
   * Override to use company-specific endpoint
   */
  override create(data: VehicleCreate): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}`, data, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create vehicle (alias)
   */
  createVehicle(vehicle: VehicleCreate): Observable<Vehicle> {
    return this.create(vehicle);
  }

  /**
   * Update existing vehicle
   * Override to use company-specific endpoint
   */
  override update(id: string, data: VehicleUpdate): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<any>(`${this.baseEndpoint}/company/${companyId}/${id}`, data, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update vehicle (alias)
   */
  updateVehicle(id: string, vehicle: VehicleUpdate): Observable<Vehicle> {
    return this.update(id, vehicle);
  }

  /**
   * Delete vehicle
   * Override to use company-specific endpoint
   */
  override delete(id: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/${id}`, undefined, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete vehicle (alias)
   */
  deleteVehicle(id: string): Observable<void> {
    return this.delete(id);
  }

  // ==================== Custom Vehicle Operations ====================

  /**
   * Check in vehicle
   */
  checkInVehicle(id: string, checkInData: VehicleCheckIn): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}/${id}/check-in`, checkInData, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Check out vehicle
   */
  checkOutVehicle(id: string, checkOutData: VehicleCheckOut): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}/${id}/check-out`, checkOutData, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Assign parking spot to vehicle
   */
  assignParkingSpot(id: string, assignment: ParkingSpotAssignment): Observable<Vehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}/${id}/assign-parking`, assignment, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get parking spots
   */
  getParkingSpots(): Observable<ParkingSpot[]> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/parking-spots`, undefined, options).pipe(
        map((response: any) => {
          return response.data || response.items || response || [];
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get vehicle statistics
   */
  getVehicleStats(): Observable<VehicleStats> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/statistics`, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Export vehicles data
   */
  exportVehicles(): Observable<Blob> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true, responseType: 'blob' as const };
      return this.api.get<Blob>(`/vehicle-data/company/${companyId}/export`, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }
}

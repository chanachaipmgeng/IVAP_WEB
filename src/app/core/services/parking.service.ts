/**
 * Parking Service
 *
 * Service for parking management operations
 * Uses new Phase 2 API endpoints
 */

/**
 * Parking Service
 *
 * Service for parking management operations
 * Uses snake_case models to match backend API
 */
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  ParkingVehicle,
  ParkingVehicleCreate,
  ParkingVehicleUpdate,
  ParkingSpace,
  ParkingSpaceCreate,
  ParkingSpaceUpdate,
  ParkingEvent,
  VehicleEntryRequest,
  VehicleExitRequest,
  ParkingReservation,
  ParkingReservationCreate,
  ParkingReservationUpdate,
  ParkingStatistics
} from '../models/parking.model';
import { PaginatedResponse } from '../models/base.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

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

  /**
   * Get company ID for API calls (with error handling)
   */
  private getCompanyIdSafe(): string | null {
    try {
      return this.getCompanyId();
    } catch {
      return null;
    }
  }

  // ==================== Vehicle Management ====================

  /**
   * Get all parking vehicles with pagination
   */
  getVehicles(params?: any): Observable<PaginatedApiResponse<ParkingVehicle>> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`/parking/vehicles`, { company_id: companyId, ...params }, options).pipe(
        map((response: any) => {
          const items = response.items || response.data || [];
          return {
            total: response.total || items.length,
            data: items,
            items: items,
            page: response.page || 1,
            size: response.size || response.page_size || items.length
          } as PaginatedApiResponse<ParkingVehicle>;
        }),
        catchError((error) => {
          console.error('Error loading parking vehicles:', error);
          return of({
            data: [],
            items: [],
            total: 0,
            page: 1,
            size: 10
          } as PaginatedApiResponse<ParkingVehicle>);
        })
      );
    } catch (error) {
      return of({
        data: [],
        items: [],
        total: 0,
        page: 1,
        size: 10
      } as PaginatedApiResponse<ParkingVehicle>);
    }
  }

  /**
   * Get parking vehicle by ID
   */
  getVehicleById(vehicleId: string): Observable<ParkingVehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`/parking/vehicles/${vehicleId}`, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new parking vehicle
   */
  createVehicle(vehicle: ParkingVehicleCreate): Observable<ParkingVehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`/parking/vehicles`, vehicle, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update parking vehicle
   */
  updateVehicle(vehicleId: string, vehicle: ParkingVehicleUpdate): Observable<ParkingVehicle> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<any>(`/parking/vehicles/${vehicleId}`, vehicle, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete parking vehicle
   */
  deleteVehicle(vehicleId: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`/parking/vehicles/${vehicleId}`, { company_id: companyId }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Parking Space Management ====================

  /**
   * Get all parking spaces with pagination
   */
  getParkingSpaces(params?: any): Observable<PaginatedApiResponse<ParkingSpace>> {
    const companyId = this.getCompanyIdSafe();
    if (!companyId) {
      console.warn('Company ID not found, returning empty parking spaces');
      return of({
        data: [],
        items: [],
        total: 0,
        page: 1,
        size: 10
      } as PaginatedApiResponse<ParkingSpace>);
    }
    const options = { skipTransform: true };
    return this.api.get<any>(`/parking/spaces`, { company_id: companyId, ...params }, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return {
          total: response.total || items.length,
          data: items,
          items: items,
          page: response.page || 1,
          size: response.size || response.page_size || items.length
        } as PaginatedApiResponse<ParkingSpace>;
      }),
      catchError((error) => {
        console.error('Error loading parking spaces:', error);
        return of({
          data: [],
          items: [],
          total: 0,
          page: 1,
          size: 10
        } as PaginatedApiResponse<ParkingSpace>);
      })
    );
  }

  /**
   * Get parking space by ID
   */
  getParkingSpaceById(spaceId: string): Observable<ParkingSpace> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`/parking/spaces/${spaceId}`, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new parking space
   */
  createParkingSpace(space: ParkingSpaceCreate): Observable<ParkingSpace> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`/parking/spaces`, space, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update parking space
   */
  updateParkingSpace(spaceId: string, space: ParkingSpaceUpdate): Observable<ParkingSpace> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<any>(`/parking/spaces/${spaceId}`, space, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete parking space
   */
  deleteParkingSpace(spaceId: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`/parking/spaces/${spaceId}`, { company_id: companyId }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Parking Events (Entry/Exit) ====================

  /**
   * Record vehicle entry
   */
  recordVehicleEntry(entry: VehicleEntryRequest): Observable<ParkingEvent> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`/parking/entry`, entry, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Record vehicle exit
   */
  recordVehicleExit(exit: VehicleExitRequest): Observable<ParkingEvent> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`/parking/exit`, exit, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get parking events with pagination
   */
  getParkingEvents(params?: any): Observable<PaginatedApiResponse<ParkingEvent>> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`/parking/events`, { company_id: companyId, ...params }, options).pipe(
        map((response: any) => {
          const items = response.items || response.data || [];
          return {
            total: response.total || items.length,
            data: items,
            items: items,
            page: response.page || 1,
            size: response.size || response.page_size || items.length
          } as PaginatedApiResponse<ParkingEvent>;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Parking Reservations ====================

  /**
   * Create parking reservation
   */
  createReservation(reservation: ParkingReservationCreate): Observable<ParkingReservation> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`/parking/reservations`, reservation, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Cancel parking reservation
   */
  cancelReservation(reservationId: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`/parking/reservations/${reservationId}`, { company_id: companyId }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Parking Statistics ====================

  /**
   * Get parking statistics
   */
  getStatistics(): Observable<ParkingStatistics> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`/parking/statistics`, { company_id: companyId }, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }
}


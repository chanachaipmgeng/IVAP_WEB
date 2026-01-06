/**
 * Parking Service
 * 
 * Service for parking management operations
 * Uses new Phase 2 API endpoints
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  // ==================== Vehicle Management ====================

  getVehicles(params?: any): Observable<PaginatedResponse<ParkingVehicle>> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<PaginatedResponse<ParkingVehicle>>(
      `/parking/vehicles`,
      { company_id: companyId, ...params }
    );
  }

  getVehicleById(vehicleId: string): Observable<ParkingVehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<ParkingVehicle>(
      `/parking/vehicles/${vehicleId}`,
      { company_id: companyId }
    );
  }

  createVehicle(vehicle: ParkingVehicleCreate): Observable<ParkingVehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<ParkingVehicle>(
      `/parking/vehicles`,
      vehicle,
      { company_id: companyId }
    );
  }

  updateVehicle(vehicleId: string, vehicle: ParkingVehicleUpdate): Observable<ParkingVehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.put<ParkingVehicle>(
      `/parking/vehicles/${vehicleId}`,
      vehicle,
      { company_id: companyId }
    );
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.delete<void>(
      `/parking/vehicles/${vehicleId}`,
      { company_id: companyId }
    );
  }

  // ==================== Parking Space Management ====================

  getParkingSpaces(params?: any): Observable<PaginatedResponse<ParkingSpace>> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      console.warn('Company ID not found, returning empty parking spaces');
      return of({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as PaginatedResponse<ParkingSpace>);
    }
    return this.api.get<PaginatedResponse<ParkingSpace>>(
      `/parking/spaces`,
      { company_id: companyId, ...params }
    ).pipe(
      catchError((error) => {
        console.error('Error loading parking spaces:', error);
        return of({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        } as PaginatedResponse<ParkingSpace>);
      })
    );
  }

  getParkingSpaceById(spaceId: string): Observable<ParkingSpace> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<ParkingSpace>(
      `/parking/spaces/${spaceId}`,
      { company_id: companyId }
    );
  }

  createParkingSpace(space: ParkingSpaceCreate): Observable<ParkingSpace> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<ParkingSpace>(
      `/parking/spaces`,
      space,
      { company_id: companyId }
    );
  }

  updateParkingSpace(spaceId: string, space: ParkingSpaceUpdate): Observable<ParkingSpace> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.put<ParkingSpace>(
      `/parking/spaces/${spaceId}`,
      space,
      { company_id: companyId }
    );
  }

  // ==================== Parking Events (Entry/Exit) ====================

  recordVehicleEntry(entry: VehicleEntryRequest): Observable<ParkingEvent> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<ParkingEvent>(
      `/parking/entry`,
      entry,
      { company_id: companyId }
    );
  }

  recordVehicleExit(exit: VehicleExitRequest): Observable<ParkingEvent> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<ParkingEvent>(
      `/parking/exit`,
      exit,
      { company_id: companyId }
    );
  }

  getParkingEvents(params?: any): Observable<PaginatedResponse<ParkingEvent>> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<PaginatedResponse<ParkingEvent>>(
      `/parking/events`,
      { company_id: companyId, ...params }
    );
  }

  // ==================== Parking Reservations ====================

  createReservation(reservation: ParkingReservationCreate): Observable<ParkingReservation> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<ParkingReservation>(
      `/parking/reservations`,
      reservation,
      { company_id: companyId }
    );
  }

  cancelReservation(reservationId: string): Observable<void> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.delete<void>(
      `/parking/reservations/${reservationId}`,
      { company_id: companyId }
    );
  }

  // ==================== Parking Statistics ====================

  getStatistics(): Observable<ParkingStatistics> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<ParkingStatistics>(
      `/parking/statistics`,
      { company_id: companyId }
    );
  }
}


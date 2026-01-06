import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  getVehicles(params?: any): Observable<PaginatedResponse<Vehicle>> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      console.warn('Company ID not found, returning empty vehicles');
      return of({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as PaginatedResponse<Vehicle>);
    }
    return this.api.get<PaginatedResponse<Vehicle>>(`/vehicles/company/${companyId}`, params).pipe(
      catchError((error) => {
        console.error('Error loading vehicles:', error);
        return of({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        } as PaginatedResponse<Vehicle>);
      })
    );
  }

  getVehicleById(id: string): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<Vehicle>(`/vehicles/company/${companyId}/${id}`);
  }

  createVehicle(vehicle: VehicleCreate): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<Vehicle>(`/vehicles/company/${companyId}`, vehicle);
  }

  updateVehicle(id: string, vehicle: VehicleUpdate): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.put<Vehicle>(`/vehicles/company/${companyId}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<void> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.delete<void>(`/vehicles/company/${companyId}/${id}`);
  }

  checkInVehicle(id: string, checkInData: VehicleCheckIn): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<Vehicle>(`/vehicles/company/${companyId}/${id}/check-in`, checkInData);
  }

  checkOutVehicle(id: string, checkOutData: VehicleCheckOut): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<Vehicle>(`/vehicles/company/${companyId}/${id}/check-out`, checkOutData);
  }

  assignParkingSpot(id: string, assignment: ParkingSpotAssignment): Observable<Vehicle> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<Vehicle>(`/vehicles/company/${companyId}/${id}/assign-parking`, assignment);
  }

  getParkingSpots(): Observable<ParkingSpot[]> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<ParkingSpot[]>(`/vehicles/company/${companyId}/parking-spots`);
  }

  getVehicleStats(): Observable<VehicleStats> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<VehicleStats>(`/vehicles/company/${companyId}/statistics`);
  }

  exportVehicles(): Observable<Blob> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<Blob>(`/vehicle-data/company/${companyId}/export`, undefined, { responseType: 'blob' });
  }
}

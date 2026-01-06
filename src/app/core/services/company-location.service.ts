import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import { CompanyLocationModel } from '../models/company-location.model';
import { PaginatedResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyLocationService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // Signal-based state management
  private locations = signal<CompanyLocationModel[]>([]);
  private loading = signal(false);

  // Getters
  getLocations = () => this.locations.asReadonly();
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
   * Load all locations for current company
   */
  loadLocations(params?: { page?: number; size?: number; sort?: string; search?: string }): Observable<CompanyLocationModel[]> {
    this.loading.set(true);
    try {
      const companyId = this.getCompanyId();
      const queryParams: any = {
        page: params?.page || 1,
        size: params?.size || 100,
        sort: params?.sort || '',
        search: params?.search || ''
      };

      return this.getLocationsByCompany(companyId, queryParams.page, queryParams.size, queryParams.sort, queryParams.search).pipe(
        tap((response) => {
          this.locations.set(response.data);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Error loading locations:', error);
          this.locations.set([]);
          this.loading.set(false);
          throw error;
        }),
        map((response) => response.data)
      );
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  /**
   * Get location by ID
   * Backend: GET /api/v1/company-locations/company/{companyId}/{locationId}
   */
  getLocationById(companyId: string, locationId: string): Observable<CompanyLocationModel> {
    return this.api.get<any>(`/company-locations/company/${companyId}/${locationId}`).pipe(
      map((response) => {
        const data = handleApiResponse<any>(response);
        return new CompanyLocationModel(data);
      })
    );
  }

  /**
   * Get locations by company
   * Backend: GET /api/v1/company-locations/company/{companyId}
   */
  getLocationsByCompany(companyId: string, page: number = 1, size: number = 100, sort: string = '', search: string = ''): Observable<PaginatedResponse<CompanyLocationModel>> {
    const params: any = { page, size };
    if (sort) params.sort = sort;
    if (search) params.search = search;

    return this.api.get<any>(`/company-locations/company/${companyId}`, params).pipe(
      map((response) => {
        const paginated = handlePaginatedResponse<any>(response);
        const limit = paginated.size || size;
        const total = paginated.total || 0;
        return {
          data: paginated.data.map((item: any) => new CompanyLocationModel(item)),
          total: total,
          page: paginated.page || page,
          limit: limit,
          totalPages: Math.ceil(total / limit)
        };
      })
    );
  }

  /**
   * Create new location
   * Backend: POST /api/v1/company-locations/company/{companyId}
   */
  createLocation(companyId: string, body: Partial<CompanyLocationModel>): Observable<CompanyLocationModel> {
    return this.api.post<any>(`/company-locations/company/${companyId}`, body).pipe(
      map((response) => {
        const data = handleApiResponse<any>(response);
        const location = new CompanyLocationModel(data);
        // Update local state
        this.locations.update(locations => [...locations, location]);
        return location;
      })
    );
  }

  /**
   * Create location for current company
   */
  createLocationForCurrentCompany(body: Partial<CompanyLocationModel>): Observable<CompanyLocationModel> {
    const companyId = this.getCompanyId();
    return this.createLocation(companyId, body);
  }

  /**
   * Update location
   * Backend: PUT /api/v1/company-locations/company/{companyId}/{locationId}
   */
  updateLocation(companyId: string, locationId: string, body: Partial<CompanyLocationModel>): Observable<CompanyLocationModel> {
    return this.api.put<any>(`/company-locations/company/${companyId}/${locationId}`, body).pipe(
      map((response) => {
        const data = handleApiResponse<any>(response);
        const location = new CompanyLocationModel(data);
        // Update local state
        this.locations.update(locations => 
          locations.map(l => l.locationId === locationId ? location : l)
        );
        return location;
      })
    );
  }

  /**
   * Update location for current company
   */
  updateLocationForCurrentCompany(locationId: string, body: Partial<CompanyLocationModel>): Observable<CompanyLocationModel> {
    const companyId = this.getCompanyId();
    return this.updateLocation(companyId, locationId, body);
  }

  /**
   * Delete location
   * Backend: DELETE /api/v1/company-locations/company/{companyId}/{locationId}
   */
  deleteLocation(companyId: string, locationId: string): Observable<void> {
    return this.api.delete<void>(`/company-locations/company/${companyId}/${locationId}`).pipe(
      tap(() => {
        // Update local state
        this.locations.update(locations => locations.filter(l => l.locationId !== locationId));
      })
    );
  }

  /**
   * Delete location for current company
   */
  deleteLocationForCurrentCompany(locationId: string): Observable<void> {
    const companyId = this.getCompanyId();
    return this.deleteLocation(companyId, locationId);
  }

  // Legacy methods for backward compatibility
  getLists(companyId: string): Observable<CompanyLocationModel[]> {
    return this.getLocationsByCompany(companyId, 0, 100, '', '').pipe(
      map(response => response.data)
    );
  }

  // Legacy methods for backward compatibility
  save(companyId: string, body: CompanyLocationModel): Observable<CompanyLocationModel> {
    return this.createLocation(companyId, body);
  }

  update(companyId: string, body: CompanyLocationModel): Observable<CompanyLocationModel> {
    return this.updateLocation(companyId, body.locationId, body);
  }

  delete(companyId: string, body: CompanyLocationModel): Observable<void> {
    return this.deleteLocation(companyId, body.locationId);
  }

  // Additional methods - Note: These endpoints may not exist in backend yet
  // Consider removing or implementing backend endpoints
  
  /**
   * Get active locations by company
   * Note: Backend endpoint may not exist - filter from getLocationsByCompany instead
   */
  getActiveLocationsByCompany(companyId: string): Observable<CompanyLocationModel[]> {
    // Use getLocationsByCompany and filter by active status
    return this.getLocationsByCompany(companyId, 1, 100, '', '').pipe(
      map(response => {
        const now = new Date();
        return response.data.filter(location => {
          const startDate = new Date(location.startDate);
          const endDate = new Date(location.endDate);
          return startDate <= now && endDate >= now;
        });
      })
    );
  }

  /**
   * Find nearby locations
   * Note: Backend endpoint may not exist - implement client-side filtering
   */
  findNearbyLocations(companyId: string, latitude: number, longitude: number, radius: number = 1): Observable<CompanyLocationModel[]> {
    // Get all locations and filter by distance client-side
    return this.getLocationsByCompany(companyId, 1, 100, '', '').pipe(
      map(response => {
        return response.data.filter(location => {
          const distance = this.calculateDistance(
            latitude, longitude,
            location.latitude, location.longitude
          );
          return distance <= radius;
        });
      })
    );
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Update location status
   * Note: Backend endpoint may not exist - use updateLocation with endDate instead
   */
  updateLocationStatus(companyId: string, locationId: string, isActive: boolean): Observable<CompanyLocationModel> {
    // If backend doesn't have this endpoint, update endDate instead
    const now = new Date();
    const endDate = isActive 
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      : new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
    
    const updateData = new CompanyLocationModel({
      endDate: endDate.toISOString()
    } as any);
    
    return this.updateLocation(companyId, locationId, updateData);
  }

  /**
   * Validate location access
   * Note: Backend endpoint may not exist - implement client-side validation
   */
  validateLocationAccess(companyId: string, latitude: number, longitude: number): Observable<{ isValid: boolean; location?: CompanyLocationModel }> {
    return this.findNearbyLocations(companyId, latitude, longitude, 1).pipe(
      map(locations => {
        const now = new Date();
        const validLocation = locations.find(location => {
          const startDate = new Date(location.startDate);
          const endDate = new Date(location.endDate);
          return startDate <= now && endDate >= now;
        });
        
        return {
          isValid: !!validLocation,
          location: validLocation
        };
      })
    );
  }
}






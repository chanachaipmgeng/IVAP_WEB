/**
 * Device Service
 * 
 * Service for managing devices (kiosks, doors, etc.)
 * Matches backend device routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UUID, PaginatedResponse } from '../models/base.model';
import {
  Device,
  DeviceCreate,
  DeviceUpdate,
  DeviceApiKeyResponse,
  DeviceFilters
} from '../models/device.model';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(private api: ApiService) {}

  /**
   * Get device API key (public endpoint)
   * Backend: GET /api/v1/device/devices/{deviceId}/key
   * @param deviceId Device ID
   * @returns Observable containing API key
   */
  public getDeviceApiKeyPublic(deviceId: UUID): Observable<DeviceApiKeyResponse> {
    return this.api.get<any>(`/devices/${deviceId}/key`).pipe(
      map(response => handleApiResponse<DeviceApiKeyResponse>(response))
    );
  }

  /**
   * Create device
   * Backend: POST /api/v1/device/company/{companyId}/devices
   * @param companyId Company ID
   * @param data Device create data
   * @returns Observable containing created device
   */
  public createDevice(companyId: UUID, data: DeviceCreate): Observable<Device> {
    return this.api.post<any>(`/devices/company/${companyId}/devices`, data).pipe(
      map(response => handleApiResponse<Device>(response))
    );
  }

  /**
   * Get all devices for a company
   * Backend: GET /api/v1/device/company/{companyId}/devices
   * @param companyId Company ID
   * @param filters Query parameters for pagination and filtering
   * @returns Observable containing paginated devices
   */
  public getDevices(companyId: UUID, filters?: DeviceFilters): Observable<PaginatedApiResponse<Device>> {
    return this.api.get<any>(`/devices/company/${companyId}/devices`, filters).pipe(
      map(response => handlePaginatedResponse<Device>(response))
    );
  }

  /**
   * Get device by ID
   * Backend: GET /api/v1/device/{deviceId}
   * @param deviceId Device ID
   * @param companyId Company ID (required query param)
   * @returns Observable containing device
   */
  public getDeviceById(deviceId: UUID, companyId: UUID): Observable<Device> {
    return this.api.get<any>(`/devices/${deviceId}`, { companyId }).pipe(
      map(response => handleApiResponse<Device>(response))
    );
  }

  /**
   * Update device
   * Backend: PUT /api/v1/device/{deviceId} or PUT /api/v1/device/company/{companyId}/devices/{deviceId}
   * @param deviceId Device ID
   * @param companyId Company ID
   * @param data Device update data
   * @param useScopedPath Use scoped path format (company/{companyId}/devices/{deviceId})
   * @returns Observable containing updated device
   */
  public updateDevice(
    deviceId: UUID,
    companyId: UUID,
    data: DeviceUpdate,
    useScopedPath: boolean = false
  ): Observable<Device> {
    if (useScopedPath) {
      return this.api.put<any>(`/devices/company/${companyId}/devices/${deviceId}`, data).pipe(
        map(response => handleApiResponse<Device>(response))
      );
    } else {
      return this.api.put<any>(`/devices/${deviceId}`, data, { companyId }).pipe(
        map(response => handleApiResponse<Device>(response))
      );
    }
  }

  /**
   * Delete device
   * Backend: DELETE /api/v1/device/{deviceId} or DELETE /api/v1/device/company/{companyId}/devices/{deviceId}
   * @param deviceId Device ID
   * @param companyId Company ID
   * @param useScopedPath Use scoped path format (company/{companyId}/devices/{deviceId})
   * @returns Observable<void>
   */
  public deleteDevice(
    deviceId: UUID,
    companyId: UUID,
    useScopedPath: boolean = false
  ): Observable<void> {
    if (useScopedPath) {
      return this.api.delete<void>(`/devices/company/${companyId}/devices/${deviceId}`);
    } else {
      return this.api.delete<void>(`/devices/${deviceId}`, { companyId });
    }
  }

  /**
   * Link device to event
   * Backend: POST /api/v1/device/{deviceId}/link-event
   * @param deviceId Device ID
   * @param eventId Event ID (null to unlink)
   * @returns Observable containing link result
   */
  public linkDeviceToEvent(deviceId: UUID, eventId: UUID | null): Observable<any> {
    return this.api.post<any>(`/devices/${deviceId}/link-event`, { eventId }).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Get device statistics
   * Backend: GET /api/v1/device/company/{companyId}/devices/statistics
   * @param companyId Company ID
   * @returns Observable containing device statistics
   */
  public getDeviceStatistics(companyId: UUID): Observable<any> {
    return this.api.get<any>(`/devices/company/${companyId}/devices/statistics`).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Get device configuration
   * Backend: GET /api/v1/device/{deviceId}/config
   * @param deviceId Device ID
   * @returns Observable containing device configuration
   */
  public getDeviceConfig(deviceId: UUID): Observable<any> {
    return this.api.get<any>(`/devices/${deviceId}/config`).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Update device configuration
   * Backend: PUT /api/v1/device/{deviceId}/config
   * @param deviceId Device ID
   * @param config Configuration data
   * @returns Observable containing updated configuration
   */
  public updateDeviceConfig(deviceId: UUID, config: any): Observable<any> {
    return this.api.put<any>(`/devices/${deviceId}/config`, config).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Device heartbeat
   * Backend: POST /api/v1/device/{deviceId}/heartbeat
   * @param deviceId Device ID
   * @param status Status data
   * @returns Observable containing heartbeat response
   */
  public deviceHeartbeat(deviceId: UUID, status: any): Observable<any> {
    return this.api.post<any>(`/devices/${deviceId}/heartbeat`, status).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Regenerate API key
   * Backend: POST /api/v1/device/{deviceId}/regenerate-key
   * @param deviceId Device ID
   * @param companyId Company ID (required query param)
   * @returns Observable containing updated device
   */
  public regenerateApiKey(deviceId: UUID, companyId: UUID): Observable<Device> {
    return this.api.post<any>(`/devices/${deviceId}/regenerate-key`, {}, { companyId }).pipe(
      map(response => handleApiResponse<Device>(response))
    );
  }

  /**
   * Get device API key
   * Backend: GET /api/v1/device/company/{companyId}/devices/{deviceId}/key
   * @param deviceId Device ID
   * @param companyId Company ID
   * @returns Observable containing API key
   */
  public getDeviceApiKey(deviceId: UUID, companyId: UUID): Observable<DeviceApiKeyResponse> {
    return this.api.get<any>(`/devices/company/${companyId}/devices/${deviceId}/key`).pipe(
      map(response => handleApiResponse<DeviceApiKeyResponse>(response))
    );
  }
}

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { KioskDevice, KioskState } from '../models/kiosk.model';

@Injectable({
  providedIn: 'root'
})
export class KioskService {
  private device = signal<KioskDevice | null>(null);
  private state = signal<KioskState>('idle');
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getDevice = () => this.device.asReadonly();
  getState = () => this.state.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load device configuration
  loadDeviceConfig(deviceId: string): Observable<KioskDevice> {
    this.loading.set(true);
    return this.api.get<KioskDevice>(`/devices/${deviceId}/config`).pipe(
      tap(device => {
        this.device.set(device);
        this.loading.set(false);
      })
    );
  }

  // Send heartbeat
  sendHeartbeat(deviceId: string, status: any): Observable<any> {
    return this.api.post<any>(`/devices/${deviceId}/heartbeat`, status);
  }

  // Get device API key
  getDeviceApiKey(deviceId: string): Observable<string> {
    return this.api.get<any>(`/devices/${deviceId}/key`).pipe(
      map(response => response.data?.api_key || response.api_key || '')
    );
  }

  // Update device config
  updateDeviceConfig(deviceId: string, config: any): Observable<any> {
    return this.api.put<any>(`/devices/${deviceId}/config`, config);
  }

  // Set state
  setState(state: KioskState): void {
    this.state.set(state);
  }

  // Set device
  setDevice(device: KioskDevice): void {
    this.device.set(device);
  }
}

/**
 * Monitoring Component
 *
 * Real-time camera monitoring component with video streaming, camera management, and alert handling.
 * Supports HLS video streaming, camera location mapping, and alert notifications.
 *
 * @example
 * ```html
 * <app-monitoring></app-monitoring>
 * ```
 */

import { Component, OnInit, signal, computed, ViewChild, ElementRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { MapComponent, MapOptions, MapMarker } from '../../../shared/components/map/map.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Camera interface
 */
interface Camera {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  streamUrl?: string;
  lat?: number;
  lng?: number;
}

/**
 * Alert interface
 */
interface Alert {
  id: number;
  type: 'intrusion' | 'fire' | 'crowd' | 'violence' | 'other';
  cameraName: string;
  timestamp: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    GlassCardComponent,
    GlassButtonComponent,
    MapComponent,
    SkeletonComponent
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  cameras = signal<Camera[]>([]);
  alerts = signal<Alert[]>([]);
  selectedCamera = signal<Camera | null>(null);
  loading = signal(false);
  errorMessage = signal<string>('');
  private hls: Hls | null = null;

  // Computed signals
  onlineCamerasCount = computed(() => this.cameras().filter(c => c.status === 'online').length);

  // Map configuration
  mapOptions: MapOptions = {
    center: { lat: 13.7563, lng: 100.5018 }, // Bangkok
    zoom: 13,
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: true
  };

  mapMarkers: MapMarker[] = [];
  googleMapsApiKey = environment.googleMapsApiKey;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
    // Effect to handle video player when selected camera changes
    effect(() => {
      const camera = this.selectedCamera();
      if (camera && camera.streamUrl && this.videoPlayer) {
        this.setupHlsPlayer(this.videoPlayer.nativeElement, camera.streamUrl);
      } else {
        this.destroyHlsPlayer();
      }
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.loadCameras();
    this.loadRecentAlerts();
  }

  override ngOnDestroy(): void {
    this.destroyHlsPlayer();
    super.ngOnDestroy();
  }

  private setupHlsPlayer(videoElement: HTMLVideoElement, streamUrl: string): void {
    this.destroyHlsPlayer(); // Clean up previous instance

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(videoElement);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(e => console.error('Autoplay failed', e));
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari and other native HLS players
      videoElement.src = streamUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play().catch(e => console.error('Autoplay failed', e));
      });
    }
  }

  private destroyHlsPlayer(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  loadCameras(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorHandler.showError('ไม่พบ Company ID');
      this.errorMessage.set('ไม่พบ Company ID');
      this.loading.set(false);
      return;
    }

    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<Camera[]>(`/company/${companyId}/devices`),
      (response: any) => {
        const devices = response.data?.items || response.data || response || [];
        const cameras = devices.filter((d: any) => d.deviceType === 'camera' || d.device_type === 'camera');
        this.cameras.set(cameras);
        this.updateMapMarkers(cameras);
        this.loading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Cameras ได้');
        this.cameras.set([]);
        this.loading.set(false);
      }
    );
  }

  loadRecentAlerts(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      // Don't show error for alerts as it's not critical
      return;
    }

    this.api.get<Alert[]>(`/alerts/company/${companyId}?limit=20`).subscribe({
      next: (response: any) => {
        this.alerts.set(response.data || response || []);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for alerts as it's not critical
        this.alerts.set([]);
      }
    });
  }

  selectCamera(camera: Camera): void {
    this.selectedCamera.set(camera);
  }

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      'intrusion': '🚨',
      'fire': '🔥',
      'crowd': '👥',
      'violence': '⚠️',
      'other': '📢'
    };
    return icons[type] || '📢';
  }

  getAlertColor(severity: string): string {
    const colors: Record<string, string> = {
      'low': 'text-blue-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  }

  acknowledgeAlert(alert: Alert): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.post(`/alerts/${alert.id}/acknowledge`, {}),
      () => {
        this.errorHandler.showSuccess('รับทราบ Alert แล้ว');
        this.loadRecentAlerts();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
      }
    );
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  updateMapMarkers(cameras: Camera[]): void {
    this.mapMarkers = cameras
      .filter(camera => camera.lat && camera.lng)
      .map(camera => ({
        lat: camera.lat!,
        lng: camera.lng!,
        title: camera.name,
        icon: camera.status === 'online' ? '🟢' : '🔴',
        info: `
          <div class="p-2">
            <h3 class="font-bold text-lg">${camera.name}</h3>
            <p class="text-sm text-gray-600">${camera.location}</p>
            <p class="text-sm ${camera.status === 'online' ? 'text-green-600' : 'text-red-600'}">
              Status: ${camera.status.toUpperCase()}
            </p>
          </div>
        `
      }));
  }

  onMapMarkerClick(marker: MapMarker): void {
    const camera = this.cameras().find(c =>
      c.lat === marker.lat && c.lng === marker.lng
    );
    if (camera) {
      this.selectCamera(camera);
    }
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}


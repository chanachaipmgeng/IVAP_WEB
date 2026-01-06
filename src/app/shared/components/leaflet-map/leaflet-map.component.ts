/**
 * Leaflet Map Component
 *
 * A map component using Leaflet.js for displaying interactive maps with markers.
 * Supports marker management, map controls, and various map options.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-leaflet-map
 *   [markers]="mapMarkers"
 *   [options]="mapOptions"
 *   [showControls]="true"
 *   [ariaLabel]="'Location map'">
 * </app-leaflet-map>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, forwardRef, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

/**
 * Map marker interface
 */
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  draggable?: boolean;
}

/**
 * Map options interface
 */
export interface MapOptions {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
  scrollWheelZoom?: boolean;
  doubleClickZoom?: boolean;
  dragging?: boolean;
  touchZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
}

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule, FormsModule, LeafletModule],
  template: `
    <div class="leaflet-map-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'Map'">
      <label *ngIf="label" [for]="mapId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1" [attr.aria-label]="'Required'">*</span>
      </label>

      <div class="map-wrapper">
        <div
          [id]="mapId"
          leaflet
          [leafletOptions]="mapOptions"
          [leafletLayers]="mapLayers"
          [leafletLayersControl]="layersControl"
          (leafletMapReady)="onMapReady($event)"
          (leafletMapMoveEnd)="onMapMoveEnd($event)"
          (leafletMapZoomEnd)="onMapZoomEnd($event)"
          (leafletClick)="onMapClick($event)"
          role="application"
          [attr.aria-label]="ariaLabel || label || 'Interactive map'"
          [attr.aria-describedby]="errorMessage ? errorId : (showInfo ? infoId : null)"
          class="leaflet-map">
        </div>

        <!-- Map Controls -->
        <div class="map-controls" *ngIf="showControls" role="toolbar" [attr.aria-label]="'Map controls'">
          <div class="control-group">
            <button
              type="button"
              (click)="fitBounds()"
              class="control-button"
              [attr.aria-label]="'Fit map to markers'"
              [attr.title]="'Fit to markers'"
              [attr.tabindex]="0">
              <span [attr.aria-hidden]="true">📍</span>
            </button>
            <button
              type="button"
              (click)="toggleFullscreen()"
              class="control-button"
              [attr.aria-label]="'Toggle fullscreen'"
              [attr.title]="'Toggle fullscreen'"
              [attr.tabindex]="0">
              <span [attr.aria-hidden]="true">⛶</span>
            </button>
            <button
              type="button"
              (click)="clearMarkers()"
              class="control-button"
              [attr.aria-label]="'Clear all markers'"
              [attr.title]="'Clear markers'"
              [attr.tabindex]="0">
              <span [attr.aria-hidden]="true">🗑️</span>
            </button>
          </div>
        </div>

        <!-- Map Info -->
        <div *ngIf="showInfo" [id]="infoId" class="map-info" role="status" [attr.aria-live]="'polite'">
          <div class="info-item">
            <span class="info-label">Zoom:</span>
            <span class="info-value">{{ currentZoom }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Center:</span>
            <span class="info-value">{{ currentCenter[0].toFixed(4) }}, {{ currentCenter[1].toFixed(4) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Markers:</span>
            <span class="info-value">{{ markers.length }}</span>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'polite'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .leaflet-map-container {
      width: 100%;
    }

    .map-wrapper {
      position: relative;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
    }

    .leaflet-map {
      height: 100%;
      width: 100%;
    }

    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-button {
      width: 40px;
      height: 40px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(20px);
      color: var(--text-primary);
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .control-button:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      transform: scale(1.05);
    }

    .map-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(20px);
      padding: 8px 12px;
      z-index: 1000;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
    }

    .info-label {
      color: var(--text-secondary);
    }

    .info-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* Leaflet custom styling */
    ::ng-deep .leaflet-container {
      background: var(--glass-bg) !important;
    }

    ::ng-deep .leaflet-popup-content-wrapper {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 8px !important;
      backdrop-filter: blur(20px) !important;
    }

    ::ng-deep .leaflet-popup-content {
      color: var(--text-primary) !important;
      font-family: 'Inter', sans-serif !important;
    }

    ::ng-deep .leaflet-popup-tip {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
    }

    ::ng-deep .leaflet-control-zoom a {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      color: var(--text-primary) !important;
      backdrop-filter: blur(20px) !important;
    }

    ::ng-deep .leaflet-control-zoom a:hover {
      background: rgba(59, 130, 246, 0.1) !important;
      border-color: #3b82f6 !important;
    }

    ::ng-deep .leaflet-control-attribution {
      background: rgba(26, 26, 46, 0.8) !important;
      color: var(--text-secondary) !important;
      backdrop-filter: blur(10px) !important;
    }

    ::ng-deep .leaflet-marker-icon {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    ::ng-deep .leaflet-marker-icon:hover {
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
      transform: scale(1.1);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LeafletMapComponent),
      multi: true
    }
  ]
})
export class LeafletMapComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /**
   * Map element reference
   */
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  /**
   * Map label
   */
  @Input() label: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Show controls
   */
  @Input() showControls: boolean = true;

  /**
   * Show info
   */
  @Input() showInfo: boolean = true;

  /**
   * Map height
   */
  @Input() height: string = '400px';

  /**
   * Map markers
   */
  @Input() markers: MapMarker[] = [];

  /**
   * Map options
   */
  @Input() mapOptions: MapOptions = {
    center: [13.7563, 100.5018], // Bangkok, Thailand
    zoom: 13,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true
  };

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Map instance
   */
  map!: L.Map;

  /**
   * Map layers
   */
  mapLayers: L.Layer[] = [];

  /**
   * Layers control
   */
  layersControl: any = {};

  /**
   * Current zoom level
   */
  currentZoom: number = 13;

  /**
   * Current center coordinates
   */
  currentCenter: [number, number] = [13.7563, 100.5018];

  /**
   * Fullscreen state
   */
  isFullscreen: boolean = false;

  /**
   * Unique map ID
   */
  mapId: string = `leaflet-map-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.mapId}-error`;

  /**
   * Unique info ID
   */
  infoId: string = `${this.mapId}-info`;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: MapMarker[]) => { };

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => { };

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeMap();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Initialize map
   */
  private initializeMap(): void {
    // Initialize map layers
    this.mapLayers = [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      })
    ];

    // Initialize layers control
    this.layersControl = {
      baseLayers: {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }),
        'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        }),
        'Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© CARTO'
        })
      },
      overlays: {}
    };
  }

  /**
   * Handle map ready
   */
  onMapReady(map: L.Map): void {
    this.map = map;
    this.currentZoom = map.getZoom();
    this.currentCenter = [map.getCenter().lat, map.getCenter().lng];

    // Add markers if any
    this.addMarkers();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Handle map move end
   */
  onMapMoveEnd(event: L.LeafletEvent): void {
    this.currentCenter = [event.target.getCenter().lat, event.target.getCenter().lng];
    this.onTouched();
  }

  /**
   * Handle map zoom end
   */
  onMapZoomEnd(event: L.LeafletEvent): void {
    this.currentZoom = event.target.getZoom();
    this.onTouched();
  }

  /**
   * Handle map click
   */
  onMapClick(event: L.LeafletMouseEvent): void {
    if (this.disabled) return;

    const lat = event.latlng.lat;
    const lng = event.latlng.lng;

    // Create new marker
    const newMarker: MapMarker = {
      id: 'marker_' + Date.now(),
      lat: lat,
      lng: lng,
      title: 'New Marker',
      description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      draggable: true
    };

    this.addMarker(newMarker);
    this.onChange(this.markers);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.map) return;

    // Add click listener for adding markers
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.disabled) return;
      this.onMapClick(e);
    });
  }

  /**
   * Add marker to map
   */
  addMarker(marker: MapMarker): void {
    if (!this.map) return;

    const leafletMarker = L.marker([marker.lat, marker.lng], {
      draggable: marker.draggable || false
    });

    // Add popup
    const popupContent = `
      <div class="marker-popup">
        <h3>${marker.title}</h3>
        <p>${marker.description || ''}</p>
        <p><strong>Coordinates:</strong> ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}</p>
        <button onclick="this.removeMarker('${marker.id}')" class="remove-marker-btn">
          Remove Marker
        </button>
      </div>
    `;

    leafletMarker.bindPopup(popupContent);

    // Add drag event
    if (marker.draggable) {
      leafletMarker.on('dragend', (e) => {
        const newLat = e.target.getLatLng().lat;
        const newLng = e.target.getLatLng().lng;

        // Update marker in array
        const index = this.markers.findIndex(m => m.id === marker.id);
        if (index !== -1) {
          this.markers[index].lat = newLat;
          this.markers[index].lng = newLng;
          this.onChange(this.markers);
        }
      });
    }

    leafletMarker.addTo(this.map);

    // Add to markers array if not already present
    if (!this.markers.find(m => m.id === marker.id)) {
      this.markers.push(marker);
    }
  }

  /**
   * Add all markers to map
   */
  addMarkers(): void {
    if (!this.map || !this.markers.length) return;

    this.markers.forEach(marker => {
      this.addMarker(marker);
    });
  }

  /**
   * Remove marker from map
   */
  removeMarker(markerId: string): void {
    if (!this.map) return;

    // Remove from array
    this.markers = this.markers.filter(m => m.id !== markerId);

    // Remove from map
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const lat = layer.getLatLng().lat;
        const lng = layer.getLatLng().lng;
        const marker = this.markers.find(m =>
          Math.abs(m.lat - lat) < 0.0001 && Math.abs(m.lng - lng) < 0.0001
        );
        if (marker && marker.id === markerId) {
          this.map.removeLayer(layer);
        }
      }
    });

    this.onChange(this.markers);
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    if (!this.map) return;

    this.markers = [];
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    this.onChange(this.markers);
  }

  /**
   * Fit map bounds to markers
   */
  fitBounds(): void {
    if (!this.map || !this.markers.length) return;

    const group = new L.FeatureGroup();
    this.markers.forEach(marker => {
      group.addLayer(L.marker([marker.lat, marker.lng]));
    });

    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    const mapWrapper = document.querySelector('.map-wrapper') as HTMLElement;
    if (mapWrapper) {
      if (this.isFullscreen) {
        mapWrapper.classList.add('fullscreen');
        mapWrapper.style.position = 'fixed';
        mapWrapper.style.top = '0';
        mapWrapper.style.left = '0';
        mapWrapper.style.width = '100vw';
        mapWrapper.style.height = '100vh';
        mapWrapper.style.zIndex = '9999';
      } else {
        mapWrapper.classList.remove('fullscreen');
        mapWrapper.style.position = 'relative';
        mapWrapper.style.top = 'auto';
        mapWrapper.style.left = 'auto';
        mapWrapper.style.width = '100%';
        mapWrapper.style.height = '400px';
        mapWrapper.style.zIndex = 'auto';
      }
    }

    // Trigger map resize
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  /**
   * Write value from form control
   */
  writeValue(value: MapMarker[]): void {
    this.markers = value || [];
    if (this.map) {
      this.addMarkers();
    }
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: MapMarker[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/**
 * Map Component (Google Maps)
 *
 * A Google Maps component wrapper for displaying interactive maps with markers.
 * Supports custom markers, info windows, and map controls.
 *
 * @example
 * ```html
 * <app-map
 *   [apiKey]="'your-api-key'"
 *   [options]="mapOptions"
 *   [markers]="markers"
 *   [height]="'500px'"
 *   [ariaLabel]="'Location map'">
 * </app-map>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var google: any;

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  icon?: string;
  info?: string;
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: string;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  mapTypeControl?: boolean;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container" [attr.aria-label]="ariaLabel || 'Map'" role="application" [attr.aria-busy]="loading ? 'true' : null">
      <div #mapElement class="map-element" [attr.aria-label]="ariaLabel || 'Interactive map'"></div>
      <div *ngIf="loading" class="map-loading" role="status" [attr.aria-live]="'polite'">
        <div class="loading-spinner" [attr.aria-hidden]="'true'"></div>
        <p>Loading map...</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .map-element {
      width: 100%;
      height: 100%;
    }

    .map-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(26, 26, 46, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 1000;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(59, 130, 246, 0.3);
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  /**
   * Map element reference
   */
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  /**
   * Map options
   */
  @Input() options: MapOptions = {
    center: { lat: 13.7563, lng: 100.5018 }, // Bangkok
    zoom: 13
  };

  /**
   * Map markers
   */
  @Input() markers: MapMarker[] = [];

  /**
   * Map height
   */
  @Input() height: string = '400px';

  /**
   * Google Maps API key
   */
  @Input() apiKey: string = '';

  /**
   * ARIA label for the map
   */
  @Input() ariaLabel?: string;

  /**
   * Map instance
   */
  private map: any = null;

  /**
   * Loading state
   */
  loading = true;

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.map) {
      // Clean up map instance
    }
  }

  private loadGoogleMaps() {
    if (typeof google !== 'undefined') {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
    script.onload = () => {
      this.initializeMap();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      this.loading = false;
    };
    document.head.appendChild(script);
  }

  private initializeMap() {
    try {
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        center: this.options.center,
        zoom: this.options.zoom,
        mapTypeId: this.options.mapTypeId || 'roadmap',
        disableDefaultUI: this.options.disableDefaultUI || false,
        zoomControl: this.options.zoomControl !== false,
        streetViewControl: this.options.streetViewControl || false,
        fullscreenControl: this.options.fullscreenControl || false,
        mapTypeControl: this.options.mapTypeControl || false,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#1a1a2e' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f3460' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      });

      this.addMarkers();
      this.loading = false;
    } catch (error) {
      console.error('Error initializing map:', error);
      this.loading = false;
    }
  }

  private addMarkers() {
    this.markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: this.map,
        title: markerData.title,
        icon: markerData.icon
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.info
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
      }
    });
  }

  /**
   * Add a marker to the map
   */
  addMarker(marker: MapMarker): void {
    if (this.map) {
      const newMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: this.map,
        title: marker.title,
        icon: marker.icon
      });

      if (marker.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: marker.info
        });

        newMarker.addListener('click', () => {
          infoWindow.open(this.map, newMarker);
        });
      }
    }
  }

  /**
   * Set map center
   */
  setCenter(lat: number, lng: number): void {
    if (this.map) {
      this.map.setCenter({ lat, lng });
    }
  }

  /**
   * Set map zoom level
   */
  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }
}








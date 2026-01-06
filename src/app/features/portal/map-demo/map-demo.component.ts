/**
 * Map Demo Component
 *
 * Demo component showcasing Leaflet map component with marker management and location features.
 * Demonstrates map markers, preset locations, and interactive map controls.
 *
 * @example
 * ```html
 * <app-map-demo></app-map-demo>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LeafletMapComponent, MapMarker } from '../../../shared/components/leaflet-map/leaflet-map.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-map-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    LeafletMapComponent
  ],
  templateUrl: './map-demo.component.html',
  styleUrl: './map-demo.component.scss'
})
export class MapDemoComponent implements OnInit {
  // Map Data
  mapMarkers = signal<MapMarker[]>([]);
  selectedMarker = signal<MapMarker | null>(null);

  // Form Data
  newMarker = signal({
    title: '',
    description: '',
    lat: 13.7563,
    lng: 100.5018,
    color: '#3b82f6',
    draggable: true
  });

  // Demo data
  demoData = signal({
    totalMarkers: 0,
    selectedMarkers: 0,
    lastUpdated: new Date()
  });

  // Preset locations
  presetLocations = [
    { name: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
    { name: 'Chiang Mai, Thailand', lat: 18.7883, lng: 98.9853 },
    { name: 'Phuket, Thailand', lat: 7.8804, lng: 98.3923 },
    { name: 'Pattaya, Thailand', lat: 12.9236, lng: 100.8825 },
    { name: 'Krabi, Thailand', lat: 8.0863, lng: 98.9063 }
  ];

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    this.loadDemoData();
  }

  loadDemoData(): void {
    // Add some demo markers
    const demoMarkers: MapMarker[] = [
      {
        id: 'demo_1',
        lat: 13.7563,
        lng: 100.5018,
        title: 'Bangkok Office',
        description: 'Main office location in Bangkok',
        color: '#3b82f6',
        draggable: true
      },
      {
        id: 'demo_2',
        lat: 18.7883,
        lng: 98.9853,
        title: 'Chiang Mai Branch',
        description: 'Northern branch office',
        color: '#8b5cf6',
        draggable: true
      },
      {
        id: 'demo_3',
        lat: 7.8804,
        lng: 98.3923,
        title: 'Phuket Resort',
        description: 'Beach resort location',
        color: '#06b6d4',
        draggable: true
      }
    ];

    this.mapMarkers.set(demoMarkers);
    this.updateDemoData();
  }

  updateDemoData(): void {
    this.demoData.update(data => ({
      ...data,
      totalMarkers: this.mapMarkers().length,
      selectedMarkers: this.selectedMarker() ? 1 : 0,
      lastUpdated: new Date()
    }));
  }

  onMarkersChange(markers: MapMarker[]): void {
    this.mapMarkers.set(markers);
    this.updateDemoData();
  }

  addMarker(): void {
    if (!this.newMarker().title) return;

    const marker: MapMarker = {
      id: 'marker_' + Date.now(),
      lat: this.newMarker().lat,
      lng: this.newMarker().lng,
      title: this.newMarker().title,
      description: this.newMarker().description,
      color: this.newMarker().color,
      draggable: this.newMarker().draggable
    };

    this.mapMarkers.update(markers => [...markers, marker]);
    this.updateDemoData();

    // Reset form
    this.newMarker.set({
      title: '',
      description: '',
      lat: 13.7563,
      lng: 100.5018,
      color: '#3b82f6',
      draggable: true
    });
  }

  removeMarker(markerId: string): void {
    this.mapMarkers.update(markers => markers.filter(m => m.id !== markerId));
    this.updateDemoData();
  }

  selectMarker(marker: MapMarker): void {
    this.selectedMarker.set(marker);
    this.updateDemoData();
  }

  clearAllMarkers(): void {
    this.mapMarkers.set([]);
    this.selectedMarker.set(null);
    this.updateDemoData();
  }

  addPresetLocation(location: any): void {
    const marker: MapMarker = {
      id: 'preset_' + Date.now(),
      lat: location.lat,
      lng: location.lng,
      title: location.name,
      description: `Preset location: ${location.name}`,
      color: '#10b981',
      draggable: true
    };

    this.mapMarkers.update(markers => [...markers, marker]);
    this.updateDemoData();
  }

  exportMarkers(): void {
    const data = {
      markers: this.mapMarkers(),
      exportDate: new Date().toISOString(),
      totalMarkers: this.mapMarkers().length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-markers.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importMarkers(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.markers && Array.isArray(data.markers)) {
          this.mapMarkers.set(data.markers);
          this.updateDemoData();
        }
      } catch (error) {
        console.error('Error importing markers:', error);
        alert('Error importing markers. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

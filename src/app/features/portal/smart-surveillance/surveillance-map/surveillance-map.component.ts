import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-surveillance-map',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './surveillance-map.component.html',
  styleUrls: ['./surveillance-map.component.scss']
})
export class SurveillanceMapComponent implements OnInit {
  protected readonly Math = Math; // Expose Math to template

  cameras = signal([
    { id: '1', name: 'Main Entrance', lat: 13.7563, lng: 100.5018, status: 'Online' },
    { id: '2', name: 'Parking Lot A', lat: 13.7565, lng: 100.5020, status: 'Online' },
    { id: '3', name: 'Rear Exit', lat: 13.7560, lng: 100.5015, status: 'Offline' }
  ]);

  constructor() {}

  ngOnInit() {}
}

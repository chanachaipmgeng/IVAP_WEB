import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-parking-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './parking-dashboard.component.html',
  styleUrls: ['./parking-dashboard.component.scss']
})
export class ParkingDashboardComponent implements OnInit {
  stats = signal({
    totalSpots: 200,
    occupied: 145,
    reserved: 15,
    available: 40
  });

  zones = signal([
    { name: 'Zone A (VIP)', capacity: 20, occupied: 15, color: 'text-purple-500' },
    { name: 'Zone B (Staff)', capacity: 100, occupied: 80, color: 'text-blue-500' },
    { name: 'Zone C (Visitor)', capacity: 80, occupied: 50, color: 'text-green-500' }
  ]);

  constructor() {}

  ngOnInit() {}
}

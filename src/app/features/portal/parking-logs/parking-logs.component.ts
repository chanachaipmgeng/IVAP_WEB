import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-parking-logs',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './parking-logs.component.html',
  styleUrls: ['./parking-logs.component.scss']
})
export class ParkingLogsComponent implements OnInit {
  logs = signal([
    { timestamp: new Date(), licensePlate: '1กก 1234', type: 'Entry', gate: 'Gate A', image: 'assets/images/car_mock.jpg' },
    { timestamp: new Date(), licensePlate: '2ขข 5678', type: 'Exit', gate: 'Gate B', duration: '2h 15m', fee: '฿40', image: 'assets/images/car_mock.jpg' },
    { timestamp: new Date(Date.now() - 3600000), licensePlate: '3คค 9012', type: 'Entry', gate: 'Gate A', image: 'assets/images/car_mock.jpg' }
  ]);

  constructor() {}

  ngOnInit() {}
}


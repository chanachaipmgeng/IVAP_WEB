import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-alert-history',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './alert-history.component.html',
  styleUrls: ['./alert-history.component.scss']
})
export class AlertHistoryComponent implements OnInit {
  alerts = signal([
    { id: '1', type: 'Intrusion', timestamp: new Date(), location: 'Zone A', severity: 'High', status: 'Resolved' },
    { id: '2', type: 'Loitering', timestamp: new Date(Date.now() - 3600000), location: 'Parking Lot', severity: 'Medium', status: 'Pending' },
    { id: '3', type: 'Object Left', timestamp: new Date(Date.now() - 7200000), location: 'Lobby', severity: 'Low', status: 'Resolved' }
  ]);

  constructor() {}

  ngOnInit() {}
}


import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './visitor-dashboard.component.html',
  styleUrls: ['./visitor-dashboard.component.scss']
})
export class VisitorDashboardComponent implements OnInit {
  todayStats = signal({
    totalVisitors: 45,
    activeVisitors: 12,
    preRegistered: 8,
    vipGuests: 3
  });

  recentActivities = signal([
    { time: '10:30', name: 'Alice Wilson', type: 'Check In', host: 'John Doe' },
    { time: '10:15', name: 'Bob Brown', type: 'Check Out', host: 'Jane Smith' },
    { time: '09:45', name: 'Charlie Davis', type: 'Check In', host: 'Admin' }
  ]);

  constructor() {}

  ngOnInit() {}
}

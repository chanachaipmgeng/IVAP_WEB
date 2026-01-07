import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-visitor-reports',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './visitor-reports.component.html',
  styleUrls: ['./visitor-reports.component.scss']
})
export class VisitorReportsComponent implements OnInit {
  logs = signal([
    { date: new Date(), visitor: 'Alice Wilson', host: 'John Doe', inTime: '09:00', outTime: '11:00', duration: '2h' },
    { date: new Date(), visitor: 'Bob Brown', host: 'Jane Smith', inTime: '10:00', outTime: '10:45', duration: '45m' },
    { date: new Date('2024-01-06'), visitor: 'Charlie Davis', host: 'Admin', inTime: '13:00', outTime: '15:30', duration: '2h 30m' }
  ]);

  constructor() {}

  ngOnInit() {}
}


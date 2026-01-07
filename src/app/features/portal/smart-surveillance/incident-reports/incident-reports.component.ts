import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-incident-reports',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './incident-reports.component.html',
  styleUrls: ['./incident-reports.component.scss']
})
export class IncidentReportsComponent implements OnInit {
  reports = signal([
    { id: 'INC-001', title: 'Unauthorized Access Attempt', date: new Date(), reportedBy: 'System', status: 'Open' },
    { id: 'INC-002', title: 'Suspicious Package', date: new Date(Date.now() - 86400000), reportedBy: 'Security Guard', status: 'Closed' }
  ]);

  constructor() {}

  ngOnInit() {}
}


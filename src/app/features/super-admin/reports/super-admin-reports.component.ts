import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-super-admin-reports',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './super-admin-reports.component.html',
  styleUrls: ['./super-admin-reports.component.scss']
})
export class SuperAdminReportsComponent implements OnInit {
  reports = signal([
    { id: 'R001', name: 'Monthly Revenue Report', type: 'Finance', date: new Date(), status: 'Ready' },
    { id: 'R002', name: 'System Performance Log', type: 'Technical', date: new Date(Date.now() - 86400000), status: 'Ready' },
    { id: 'R003', name: 'User Growth Analytics', type: 'Usage', date: new Date(Date.now() - 172800000), status: 'Generating...' }
  ]);

  constructor() {}

  ngOnInit() {}
}









import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-super-admin-announcements',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './super-admin-announcements.component.html',
  styleUrls: ['./super-admin-announcements.component.scss']
})
export class SuperAdminAnnouncementsComponent implements OnInit {
  announcements = signal([
    { id: '1', title: 'System Maintenance Scheduled', content: 'We will be performing maintenance on Sunday.', date: new Date(), type: 'Maintenance' },
    { id: '2', title: 'New Feature Released', content: 'Check out the new Face Recognition module!', date: new Date(Date.now() - 86400000), type: 'Feature' }
  ]);

  constructor() {}

  ngOnInit() {}
}






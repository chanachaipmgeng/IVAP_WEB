import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-company-holidays',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './company-holidays.component.html',
  styleUrls: ['./company-holidays.component.scss']
})
export class CompanyHolidaysComponent implements OnInit {
  holidays = signal([
    { name: 'New Year\'s Day', date: new Date('2026-01-01'), type: 'Public Holiday' },
    { name: 'Songkran Festival', date: new Date('2026-04-13'), type: 'Public Holiday' }
  ]);

  constructor() {}

  ngOnInit() {}
}


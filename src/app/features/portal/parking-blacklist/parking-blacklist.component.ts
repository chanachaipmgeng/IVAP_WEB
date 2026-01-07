import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-parking-blacklist',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './parking-blacklist.component.html',
  styleUrls: ['./parking-blacklist.component.scss']
})
export class ParkingBlacklistComponent implements OnInit {
  blockedPlates = signal([
    { plate: '1กข 9999', reason: 'Unpaid Fees', blockedBy: 'System', date: new Date() },
    { plate: '2คต 5555', reason: 'Security Alert', blockedBy: 'Admin', date: new Date(Date.now() - 86400000) }
  ]);

  constructor() {}

  ngOnInit() {}
}


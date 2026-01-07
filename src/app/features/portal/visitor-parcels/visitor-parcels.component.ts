import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-visitor-parcels',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './visitor-parcels.component.html',
  styleUrls: ['./visitor-parcels.component.scss']
})
export class VisitorParcelsComponent implements OnInit {
  parcels = signal([
    { id: 'P-001', recipient: 'John Doe', carrier: 'Kerry', tracking: 'KERRY12345', arrived: new Date(), status: 'Pending Pickup' },
    { id: 'P-002', recipient: 'Jane Smith', carrier: 'Flash', tracking: 'FLA8888', arrived: new Date(Date.now() - 3600000), status: 'Picked Up' }
  ]);

  constructor() {}

  ngOnInit() {}
}


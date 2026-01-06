/**
 * Parking Statistics Component
 *
 * Component for displaying parking statistics and metrics.
 * Shows occupancy rates, revenue, and parking space utilization.
 *
 * @example
 * ```html
 * <app-parking-statistics></app-parking-statistics>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ParkingService } from '../../../core/services/parking.service';
import { ParkingStatistics } from '../../../core/models/parking.model';

@Component({
  selector: 'app-parking-statistics',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, LoadingComponent],
  templateUrl: './parking-statistics.component.html',
  styleUrl: './parking-statistics.component.scss'
})
export class ParkingStatisticsComponent implements OnInit {
  statistics = signal<ParkingStatistics | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed stats
  occupancyPercentage = computed(() => 
    this.statistics() ? 
      ((this.statistics()!.occupiedSpaces / this.statistics()!.totalSpaces) * 100).toFixed(1) 
      : '0'
  );

  constructor(private parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.parkingService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.error.set('Failed to load statistics');
        this.loading.set(false);
      }
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '฿0.00';
    return `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
  }
}


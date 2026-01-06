/**
 * Maintenance Component
 *
 * Displays a maintenance page with countdown timer, progress indicator, and maintenance updates.
 * Shows estimated completion time and list of maintenance tasks.
 *
 * @example
 * ```html
 * <app-maintenance
 *   [customClass]="'my-maintenance-page'"
 *   [ariaLabel]="'System maintenance'">
 * </app-maintenance>
 * ```
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Maintenance start time
   */
  maintenanceStartTime: Date = new Date();

  /**
   * Estimated end time
   */
  estimatedEndTime: Date = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

  /**
   * Current time
   */
  currentTime: Date = new Date();

  /**
   * Time remaining string
   */
  timeRemaining: string = '';

  /**
   * Progress percentage
   */
  progress: number = 0;

  /**
   * Timer subscription
   */
  private timerSubscription?: Subscription;

  /**
   * Features being updated
   */
  features: string[] = [
    'Enhanced security protocols',
    'Improved performance optimization',
    'New user interface updates',
    'Advanced analytics features',
    'Mobile app improvements',
    'Database optimization'
  ];

  /**
   * Maintenance updates timeline
   */
  updates: MaintenanceUpdate[] = [
    {
      time: '10:00 AM',
      status: 'completed',
      description: 'System backup completed successfully'
    },
    {
      time: '10:15 AM',
      status: 'completed',
      description: 'Database migration in progress'
    },
    {
      time: '10:30 AM',
      status: 'in_progress',
      description: 'Application updates being deployed'
    },
    {
      time: '11:00 AM',
      status: 'pending',
      description: 'Security patches installation'
    },
    {
      time: '11:30 AM',
      status: 'pending',
      description: 'Performance optimization'
    },
    {
      time: '12:00 PM',
      status: 'pending',
      description: 'System testing and validation'
    }
  ];

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.startTimer();
    this.calculateProgress();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  /**
   * Start countdown timer
   */
  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
      this.calculateTimeRemaining();
      this.calculateProgress();
    });
  }

  /**
   * Calculate time remaining
   */
  calculateTimeRemaining(): void {
    const now = this.currentTime.getTime();
    const end = this.estimatedEndTime.getTime();
    const diff = end - now;

    if (diff <= 0) {
      this.timeRemaining = 'Maintenance completed!';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate maintenance progress
   */
  calculateProgress(): void {
    const now = this.currentTime.getTime();
    const start = this.maintenanceStartTime.getTime();
    const end = this.estimatedEndTime.getTime();

    const totalDuration = end - start;
    const elapsed = now - start;

    this.progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }

  /**
   * Refresh page
   */
  refreshPage(): void {
    window.location.reload();
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Get status icon SVG path
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'in_progress':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'pending':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#48bb78';
      case 'in_progress':
        return '#ed8936';
      case 'pending':
        return '#a0aec0';
      default:
        return '#a0aec0';
    }
  }

  /**
   * Check if maintenance is complete
   */
  isMaintenanceComplete(): boolean {
    return this.currentTime >= this.estimatedEndTime;
  }

  /**
   * TrackBy function for updates
   */
  trackByUpdate(index: number, update: MaintenanceUpdate): string {
    return update.time + update.status;
  }

  /**
   * TrackBy function for features
   */
  trackByFeature(index: number, feature: string): string {
    return feature;
  }
}

interface MaintenanceUpdate {
  time: string;
  status: 'completed' | 'in_progress' | 'pending';
  description: string;
}


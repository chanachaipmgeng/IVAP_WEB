/**
 * Statistics Grid Component
 *
 * Displays a grid of statistics cards. Used to show multiple statistics in a responsive grid layout.
 *
 * @example
 * ```html
 * <app-statistics-grid
 *   [stats]="statistics"
 *   [columns]="4">
 * </app-statistics-grid>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsCardComponent } from '../statistics-card/statistics-card.component';

/**
 * Statistics card interface
 */
export interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  suffix?: string;
  iconBgClass?: string;
}

@Component({
  selector: 'app-statistics-grid',
  standalone: true,
  imports: [CommonModule, StatisticsCardComponent],
  template: `
    <div
      [ngClass]="gridClasses"
      [class]="customClass || ''"
      role="group"
      [attr.aria-label]="ariaLabel || 'Statistics'">
      <app-statistics-card
        *ngFor="let stat of stats; trackBy: trackByStat"
        [icon]="stat.icon"
        [label]="stat.label"
        [value]="stat.value"
        [suffix]="stat.suffix"
        [iconBgClass]="stat.iconBgClass || 'bg-blue-100 dark:bg-blue-900'"
      />
    </div>
  `,
  styles: []
})
export class StatisticsGridComponent {
  /**
   * Statistics cards data
   */
  @Input() stats!: StatCard[];

  /**
   * Number of columns in grid layout
   */
  @Input() columns: number = 4;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Get grid CSS classes based on columns
   */
  get gridClasses(): string {
    const cols: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-6'
    };
    return `grid ${cols[this.columns] || 'grid-cols-1 md:grid-cols-4'} gap-6`;
  }

  /**
   * TrackBy function for statistics cards
   */
  trackByStat(index: number, stat: StatCard): string {
    return stat.label || index.toString();
  }
}


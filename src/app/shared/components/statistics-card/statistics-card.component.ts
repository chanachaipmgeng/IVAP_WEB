/**
 * Statistics Card Component
 *
 * Displays a single statistics card with icon, label, value, and optional suffix.
 * Used to show individual statistics in a grid or list layout.
 *
 * @example
 * ```html
 * <app-statistics-card
 *   icon="📊"
 *   label="Total Users"
 *   [value]="userCount"
 *   suffix=" users">
 * </app-statistics-card>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../glass-card/glass-card.component';

@Component({
  selector: 'app-statistics-card',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  template: `
    <app-glass-card [customClass]="customClass || 'p-6'" [ariaLabel]="ariaLabel || label || 'Statistics card'">
      <div class="flex items-center" role="group" [attr.aria-label]="label">
        <div class="p-3 rounded-full" [ngClass]="iconBgClass" [attr.aria-hidden]="true">
          <span class="text-2xl">{{ icon }}</span>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ label }}
          </p>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" [attr.aria-label]="getValueLabel()">
            {{ value }}{{ suffix }}
          </p>
        </div>
      </div>
    </app-glass-card>
  `,
  styles: []
})
export class StatisticsCardComponent {
  /**
   * Icon to display (emoji or icon string)
   */
  @Input() icon!: string;

  /**
   * Label text
   */
  @Input() label!: string;

  /**
   * Value to display
   */
  @Input() value!: string | number;

  /**
   * Optional suffix after value
   */
  @Input() suffix?: string;

  /**
   * Icon background CSS classes
   */
  @Input() iconBgClass: string = 'bg-primary-100 dark:bg-primary-900';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Get value label for accessibility
   */
  getValueLabel(): string {
    return `${this.value}${this.suffix || ''}`;
  }
}


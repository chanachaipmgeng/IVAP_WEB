/**
 * Loading Component
 *
 * Displays a loading spinner with optional message. Used to indicate that content is being loaded.
 *
 * @example
 * ```html
 * <app-loading [show]="isLoading" message="Loading data..."></app-loading>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      class="flex items-center justify-center"
      [ngClass]="containerClass || customClass || 'min-h-[200px]'"
      role="status"
      [attr.aria-label]="ariaLabel || message || 'Loading'"
      [attr.aria-busy]="true"
      [attr.aria-live]="ariaLive">
      <div class="glass-card p-8 flex flex-col items-center space-y-4">
        <div class="relative" [attr.aria-hidden]="true">
          <div class="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p *ngIf="message" class="text-gray-700 dark:text-gray-300 font-medium">
          {{ message }}
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoadingComponent {
  /**
   * Show/hide loading indicator
   */
  @Input() show: boolean = true;

  /**
   * Loading message
   */
  @Input() message: string = '';

  /**
   * Container CSS classes
   */
  @Input() containerClass: string = 'min-h-[200px]';

  /**
   * Custom CSS classes (alternative to containerClass)
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA live region setting
   */
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'polite';
}


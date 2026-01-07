/**
 * Divider Component
 *
 * A simple divider component for separating content.
 * Supports horizontal and vertical orientations with optional text label.
 *
 * @example
 * ```html
 * <app-divider [vertical]="false" text="OR" spacing="md"></app-divider>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  template: `
    <mat-divider
      [vertical]="vertical"
      [inset]="inset"
      [class]="getDividerClasses()"
      [attr.role]="'separator'"
      [attr.aria-orientation]="vertical ? 'vertical' : 'horizontal'"
      [attr.aria-label]="ariaLabel || text || 'Divider'">
      @if (text) {
        <span class="divider-text" [attr.aria-hidden]="false">{{ text }}</span>
      }
    </mat-divider>
  `,
  styles: [`
    :host {
      display: block;
    }

    .divider-text {
      @apply px-4 text-sm text-gray-500 bg-white;
    }

    .divider-spacing-sm {
      @apply my-2;
    }

    .divider-spacing-md {
      @apply my-4;
    }

    .divider-spacing-lg {
      @apply my-6;
    }
  `]
})
export class DividerComponent {
  /**
   * Vertical orientation
   */
  @Input() vertical: boolean = false;

  /**
   * Inset divider
   */
  @Input() inset: boolean = false;

  /**
   * Optional text label
   */
  @Input() text: string = '';

  /**
   * Spacing size
   */
  @Input() spacing: 'sm' | 'md' | 'lg' | 'none' = 'md';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for the divider
   */
  @Input() ariaLabel?: string;

  /**
   * Get divider CSS classes
   */
  getDividerClasses(): string {
    const classes = ['divider'];

    if (this.spacing !== 'none') {
      classes.push(`divider-spacing-${this.spacing}`);
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }
}

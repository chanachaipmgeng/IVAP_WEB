/**
 * Badge Component
 *
 * A versatile badge/chip component for displaying status, labels, and tags.
 * Supports multiple variants, sizes, shapes, and interactive states.
 *
 * @example
 * ```html
 * <app-badge
 *   text="New"
 *   variant="primary"
 *   size="md"
 *   shape="pill"
 *   [dismissible]="true"
 *   (dismissed)="onDismiss()">
 * </app-badge>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'square';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span
      [class]="getBadgeClasses()"
      [style.background-color]="customColor"
      [style.color]="customTextColor"
      (click)="onClick()"
      [attr.aria-label]="ariaLabel || text || 'Badge'"
      [attr.role]="clickable ? 'button' : 'status'"
      [attr.tabindex]="clickable ? 0 : -1"
      [attr.aria-pressed]="clickable ? (isPressed ? 'true' : 'false') : null">
      
      @if (icon && !iconRight) {
        <mat-icon [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
      }
      
      <ng-content></ng-content>
      
      @if (text && !hasContent) {
        <span [attr.aria-hidden]="false">{{ text }}</span>
      }
      
      @if (icon && iconRight) {
        <mat-icon [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
      }
      
      @if (dismissible) {
        <mat-icon
          class="badge-close"
          (click)="onDismiss($event)"
          [attr.aria-label]="dismissAriaLabel || 'Dismiss ' + (text || 'badge')"
          role="button"
          [attr.tabindex]="0"
          [attr.aria-hidden]="false">close</mat-icon>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      vertical-align: middle;
      transition: all 0.2s ease-in-out;
      user-select: none;
    }

    /* Sizes - Using Design Tokens */
    .badge-xs {
      @apply px-1.5 py-0.5 text-xs min-h-[1rem];
    }

    .badge-sm {
      @apply px-2 py-0.5 text-xs min-h-[1.25rem];
    }

    .badge-md {
      @apply px-2.5 py-1 text-sm min-h-[1.5rem];
    }

    .badge-lg {
      @apply px-3 py-1.5 text-base min-h-[1.75rem];
    }

    /* Shapes - Using Design Tokens */
    .badge-rounded {
      @apply rounded-md;
    }

    .badge-pill {
      @apply rounded-full;
    }

    .badge-square {
      @apply rounded-none;
    }

    /* Variants - Using Design Tokens via Tailwind */
    .badge-default {
      @apply bg-gray-500 text-white;
    }

    .badge-primary {
      @apply bg-primary-500 text-white;
    }

    .badge-success {
      @apply bg-success-500 text-white;
    }

    .badge-warning {
      @apply bg-warning-500 text-white;
    }

    .badge-danger {
      @apply bg-error-500 text-white;
    }

    .badge-info {
      @apply bg-info-500 text-white;
    }

    .badge-secondary {
      @apply bg-secondary-500 text-white;
    }

    /* Outline variant */
    .badge-outline {
      @apply bg-transparent border border-current;
    }

    .badge-outline.badge-default {
      @apply text-gray-500 border-gray-500;
    }

    .badge-outline.badge-primary {
      @apply text-primary-500 border-primary-500;
    }

    .badge-outline.badge-success {
      @apply text-success-500 border-success-500;
    }

    .badge-outline.badge-warning {
      @apply text-warning-500 border-warning-500;
    }

    .badge-outline.badge-danger {
      @apply text-error-500 border-error-500;
    }

    .badge-outline.badge-info {
      @apply text-info-500 border-info-500;
    }

    .badge-outline.badge-secondary {
      @apply text-secondary-500 border-secondary-500;
    }

    /* Interactive */
    .badge-clickable {
      @apply cursor-pointer hover:opacity-80 hover:-translate-y-[1px] active:translate-y-0;
    }

    /* Icons */
    mat-icon {
      font-size: inherit;
      width: 1em;
      height: 1em;
      line-height: 1;
    }

    .badge-close {
      @apply ml-1 cursor-pointer opacity-70 transition-opacity hover:opacity-100;
    }

    /* Dot variant */
    .badge-dot {
      @apply w-2 h-2 p-0 rounded-full min-h-[0.5rem];
    }
  `]
})

export class BadgeComponent {
  /**
   * Badge text content
   * @default ''
   */
  @Input() text: string = '';

  /**
   * Visual variant
   * @default 'default'
   */
  @Input() variant: BadgeVariant = 'default';

  /**
   * Badge size
   * @default 'md'
   */
  @Input() size: BadgeSize = 'md';

  /**
   * Badge shape
   * @default 'rounded'
   */
  @Input() shape: BadgeShape = 'rounded';

  /**
   * Whether to use outline style
   * @default false
   */
  @Input() outline: boolean = false;

  /**
   * Whether to display as dot only
   * @default false
   */
  @Input() dot: boolean = false;

  /**
   * Icon name (Material Icons)
   * @default ''
   */
  @Input() icon: string = '';

  /**
   * Whether icon is on the right
   * @default false
   */
  @Input() iconRight: boolean = false;

  /**
   * Whether badge can be dismissed
   * @default false
   */
  @Input() dismissible: boolean = false;

  /**
   * ARIA label for dismiss button
   */
  @Input() dismissAriaLabel?: string;

  /**
   * Whether badge is clickable
   * @default false
   */
  @Input() clickable: boolean = false;

  /**
   * Custom background color
   * @default ''
   */
  @Input() customColor: string = '';

  /**
   * Custom text color
   * @default ''
   */
  @Input() customTextColor: string = '';

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * Additional CSS classes for icon
   * @default ''
   */
  @Input() iconClass: string = '';

  /**
   * ARIA label for accessibility
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when badge is clicked (if clickable)
   */
  @Output() clicked = new EventEmitter<void>();

  /**
   * Emitted when badge is dismissed (if dismissible)
   */
  @Output() dismissed = new EventEmitter<void>();

  /**
   * Has content flag
   */
  hasContent: boolean = false;

  /**
   * Is pressed state (for clickable badges)
   */
  isPressed: boolean = false;

  ngAfterContentInit(): void {
    // Check if content projection exists
    this.hasContent = true;
  }

  /**
   * Get badge CSS classes
   */
  getBadgeClasses(): string {
    const classes: string[] = ['badge'];

    if (this.dot) {
      classes.push('badge-dot');
    } else {
      classes.push(`badge-${this.size}`);
      classes.push(`badge-${this.shape}`);
    }

    classes.push(`badge-${this.variant}`);

    if (this.outline && !this.dot) {
      classes.push('badge-outline');
    }

    if (this.clickable) {
      classes.push('badge-clickable');
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  /**
   * Handle badge click
   */
  onClick(): void {
    if (this.clickable) {
      this.isPressed = !this.isPressed;
      this.clicked.emit();
    }
  }

  onDismiss(event: Event): void {
    event.stopPropagation();
    this.dismissed.emit();
  }
}

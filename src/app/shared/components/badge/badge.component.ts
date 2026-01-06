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
      <mat-icon *ngIf="icon && !iconRight" [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
      <ng-content></ng-content>
      <span *ngIf="text && !hasContent" [attr.aria-hidden]="false">{{ text }}</span>
      <mat-icon *ngIf="icon && iconRight" [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
      <mat-icon
        *ngIf="dismissible"
        class="badge-close"
        (click)="onDismiss($event)"
        [attr.aria-label]="dismissAriaLabel || 'Dismiss ' + (text || 'badge')"
        role="button"
        [attr.tabindex]="0"
        [attr.aria-hidden]="false">close</mat-icon>
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
      padding: calc(var(--spacing-xs) / 2) calc(var(--spacing-xs) + var(--spacing-xs) / 2);
      font-size: var(--font-size-xs);
      min-height: 1rem;
    }

    .badge-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-xs);
      min-height: 1.25rem;
    }

    .badge-md {
      padding: calc(var(--spacing-xs) + var(--spacing-xs) / 2) calc(var(--spacing-sm) + var(--spacing-xs));
      font-size: var(--font-size-sm);
      min-height: 1.5rem;
    }

    .badge-lg {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
      min-height: 1.75rem;
    }

    /* Shapes - Using Design Tokens */
    .badge-rounded {
      border-radius: var(--radius-md);
    }

    .badge-pill {
      border-radius: 9999px;
    }

    .badge-square {
      border-radius: 0;
    }

    /* Variants - Using Design Tokens */
    .badge-default {
      background-color: var(--color-gray-500);
      color: #ffffff;
    }

    .badge-primary {
      background-color: var(--color-primary-500);
      color: #ffffff;
    }

    .badge-success {
      background-color: var(--color-success-500);
      color: #ffffff;
    }

    .badge-warning {
      background-color: var(--color-warning-500);
      color: #ffffff;
    }

    .badge-danger {
      background-color: var(--color-error-500);
      color: #ffffff;
    }

    .badge-info {
      background-color: var(--color-info-500);
      color: #ffffff;
    }

    .badge-secondary {
      background-color: var(--color-secondary-500);
      color: #ffffff;
    }

    /* Outline variant */
    .badge-outline {
      background-color: transparent;
      border: 1px solid currentColor;
    }

    .badge-outline.badge-default {
      color: var(--color-gray-500);
      border-color: var(--color-gray-500);
    }

    .badge-outline.badge-primary {
      color: var(--color-primary-500);
      border-color: var(--color-primary-500);
    }

    .badge-outline.badge-success {
      color: var(--color-success-500);
      border-color: var(--color-success-500);
    }

    .badge-outline.badge-warning {
      color: var(--color-warning-500);
      border-color: var(--color-warning-500);
    }

    .badge-outline.badge-danger {
      color: var(--color-error-500);
      border-color: var(--color-error-500);
    }

    .badge-outline.badge-info {
      color: var(--color-info-500);
      border-color: var(--color-info-500);
    }

    .badge-outline.badge-secondary {
      color: var(--color-secondary-500);
      border-color: var(--color-secondary-500);
    }

    /* Interactive */
    .badge-clickable {
      cursor: pointer;
    }

    .badge-clickable:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    .badge-clickable:active {
      transform: translateY(0);
    }

    /* Icons */
    mat-icon {
      font-size: inherit;
      width: 1em;
      height: 1em;
      line-height: 1;
    }

    .badge-close {
      margin-left: var(--spacing-xs); /* 4px */
      cursor: pointer;
      opacity: 0.7;
      transition: opacity var(--transition-fast); /* 150ms */
    }

    .badge-close:hover {
      opacity: 1;
    }

    /* Dot variant */
    .badge-dot {
      width: 0.5rem;
      height: 0.5rem;
      padding: 0;
      border-radius: 50%;
      min-height: 0.5rem;
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

/**
 * Alert Component
 *
 * A flexible alert/banner component for displaying important messages.
 * Supports multiple variants, dismissible, and icon support.
 *
 * @example
 * ```html
 * <app-alert
 *   variant="success"
 *   title="Success!"
 *   message="Operation completed successfully"
 *   [dismissible]="true"
 *   (dismissed)="onAlertDismissed()">
 * </app-alert>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'default';
export type AlertSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      [class]="getAlertClasses()"
      [attr.role]="role"
      [attr.aria-live]="ariaLive"
      [attr.aria-atomic]="true"
      [attr.aria-label]="ariaLabel || title || 'Alert'">
      <div class="alert-content">
        <mat-icon *ngIf="icon" [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
        <div class="alert-body">
          <h4 *ngIf="title" [id]="alertTitleId" class="alert-title">{{ title }}</h4>
          <div class="alert-message" [attr.aria-describedby]="title ? alertTitleId : null">
            <ng-content></ng-content>
            <p *ngIf="message && !hasContent">{{ message }}</p>
          </div>
        </div>
      </div>
      <button
        *ngIf="dismissible"
        type="button"
        class="alert-close"
        (click)="onDismiss()"
        [attr.aria-label]="closeAriaLabel || 'Close alert'"
        [attr.aria-describedby]="title ? alertTitleId : null">
        <mat-icon [attr.aria-hidden]="true">close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    div {
      position: relative;
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: flex-start;
      gap: calc(var(--spacing-sm) + var(--spacing-xs));
      transition: var(--transition-normal);
    }

    /* Variants - Using Design Tokens */
    .alert-info {
      background-color: rgba(6, 182, 212, 0.1); /* info-500 with opacity */
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: var(--color-info-600);
    }

    .alert-success {
      background-color: rgba(16, 185, 129, 0.1); /* success-500 with opacity */
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--color-success-700);
    }

    .alert-warning {
      background-color: rgba(245, 158, 11, 0.1); /* warning-500 with opacity */
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--color-warning-800);
    }

    .alert-danger {
      background-color: rgba(239, 68, 68, 0.1); /* error-500 with opacity */
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--color-error-800);
    }

    .alert-default {
      background-color: var(--color-gray-100);
      border: 1px solid var(--color-gray-300);
      color: var(--color-gray-700);
    }

    /* Sizes - Using Design Tokens */
    .alert-sm {
      padding: var(--spacing-sm) calc(var(--spacing-sm) + var(--spacing-xs));
      font-size: var(--font-size-sm);
    }

    .alert-md {
      padding: var(--spacing-md);
      font-size: var(--font-size-base);
    }

    .alert-lg {
      padding: calc(var(--spacing-md) + var(--spacing-xs)) var(--spacing-lg);
      font-size: var(--font-size-lg);
    }

    /* Content */
    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      flex: 1;
    }

    .alert-body {
      flex: 1;
    }

    .alert-title {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      font-size: 1em;
    }

    .alert-message {
      margin: 0;
      line-height: 1.5;
    }

    .alert-message p {
      margin: 0;
    }

    /* Icons */
    mat-icon {
      font-size: 1.25em;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
      margin-top: 0.125em;
    }

    /* Close button */
    .alert-close {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.125em;
    }

    .alert-close:hover {
      opacity: 1;
    }

    .alert-close mat-icon {
      font-size: 1.125em;
      width: 1.125em;
      height: 1.125em;
    }

    /* Solid variant - Using Design Tokens */
    .alert-solid.alert-info {
      background-color: var(--color-info-500);
      border-color: var(--color-info-500);
      color: #ffffff;
    }

    .alert-solid.alert-success {
      background-color: var(--color-success-500);
      border-color: var(--color-success-500);
      color: #ffffff;
    }

    .alert-solid.alert-warning {
      background-color: var(--color-warning-500);
      border-color: var(--color-warning-500);
      color: #ffffff;
    }

    .alert-solid.alert-danger {
      background-color: var(--color-error-500);
      border-color: var(--color-error-500);
      color: #ffffff;
    }

    .alert-solid.alert-default {
      background-color: var(--color-gray-500);
      border-color: var(--color-gray-500);
      color: #ffffff;
    }

    /* Outline variant */
    .alert-outline {
      background-color: transparent;
    }

    .alert-outline.alert-info {
      border-color: var(--color-info-500);
      color: var(--color-info-500);
    }

    .alert-outline.alert-success {
      border-color: var(--color-success-500);
      color: var(--color-success-500);
    }

    .alert-outline.alert-warning {
      border-color: var(--color-warning-500);
      color: var(--color-warning-500);
    }

    .alert-outline.alert-danger {
      border-color: var(--color-error-500);
      color: var(--color-error-500);
    }

    .alert-outline.alert-default {
      border-color: var(--color-gray-500);
      color: var(--color-gray-500);
    }
  `]
})
export class AlertComponent {
  /**
   * Alert variant
   * @default 'default'
   */
  @Input() variant: AlertVariant = 'default';

  /**
   * Alert size
   * @default 'md'
   */
  @Input() size: AlertSize = 'md';

  /**
   * Alert title
   * @default ''
   */
  @Input() title: string = '';

  /**
   * Alert message
   * @default ''
   */
  @Input() message: string = '';

  /**
   * Icon name (Material Icons)
   * @default ''
   */
  @Input() icon: string = '';

  /**
   * Whether alert can be dismissed
   * @default false
   */
  @Input() dismissible: boolean = false;

  /**
   * Whether to use solid variant
   * @default false
   */
  @Input() solid: boolean = false;

  /**
   * Whether to use outline variant
   * @default false
   */
  @Input() outline: boolean = false;

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
   * ARIA role
   * @default 'alert'
   */
  @Input() role: string = 'alert';

  /**
   * ARIA live region setting
   * @default 'polite'
   */
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'polite';

  /**
   * ARIA label for the alert
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA label for close button
   */
  @Input() closeAriaLabel?: string;

  /**
   * Emitted when alert is dismissed
   */
  @Output() dismissed = new EventEmitter<void>();

  /**
   * Has content flag
   */
  hasContent: boolean = false;

  /**
   * Unique alert title ID
   */
  alertTitleId: string = `alert-title-${Math.random().toString(36).substr(2, 9)}`;

  ngAfterContentInit(): void {
    this.hasContent = true;
  }

  /**
   * Get alert CSS classes
   */
  getAlertClasses(): string {
    const classes: string[] = ['alert'];

    classes.push(`alert-${this.variant}`);
    classes.push(`alert-${this.size}`);

    if (this.solid) {
      classes.push('alert-solid');
    } else if (this.outline) {
      classes.push('alert-outline');
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  getDefaultIcon(): string {
    const iconMap: Record<AlertVariant, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      danger: 'error',
      default: 'notifications'
    };
    return iconMap[this.variant];
  }

  ngOnInit(): void {
    if (!this.icon) {
      this.icon = this.getDefaultIcon();
    }
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}

/**
 * Error Message Component
 *
 * Displays error, warning, info, or success messages with optional action buttons.
 * Supports different message types with appropriate styling and icons.
 *
 * @example
 * ```html
 * <app-error-message
 *   [message]="errorMessage"
 *   (close)="onClose()"
 *   (action)="onAction()">
 * </app-error-message>
 * ```
 */

import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorMessage } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div
        class="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-lg shadow-lg border backdrop-blur-lg transition-all duration-300"
        [ngClass]="getMessageClasses()"
        [class]="customClass || ''"
        role="alert"
        [attr.aria-label]="ariaLabel || getMessageTypeLabel()"
        [attr.aria-live]="ariaLive"
        [attr.aria-atomic]="true">
        <div class="flex items-start">
          <div class="flex-shrink-0" [attr.aria-hidden]="true">
            <span class="text-2xl">{{ getIcon() }}</span>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" [ngClass]="getTextClasses()">
              {{ message.message }}
            </p>
            @if (message.action) {
              <div class="mt-2">
                <button
                  (click)="onActionClick()"
                  class="text-sm font-medium underline hover:opacity-80"
                  [ngClass]="getTextClasses()"
                  [attr.aria-label]="message.action.label">
                  {{ message.action.label }}
                </button>
              </div>
            }
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              (click)="onClose()"
              class="inline-flex rounded-md p-1.5 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
              [ngClass]="getButtonClasses()"
              [attr.aria-label]="closeAriaLabel || 'Close'">
              <span class="sr-only">{{ closeAriaLabel || 'Close' }}</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" [attr.aria-hidden]="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ErrorMessageComponent {
  /**
   * Error message to display
   */
  @Input() message: ErrorMessage | null = null;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA live region setting
   */
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'assertive';

  /**
   * ARIA label for close button
   */
  @Input() closeAriaLabel?: string;

  /**
   * Close event
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Action event
   */
  @Output() action = new EventEmitter<void>();

  /**
   * Get message CSS classes based on type
   */
  getMessageClasses(): string {
    if (!this.message) return '';

    // Using Tailwind classes which map to design tokens via config
    switch (this.message.type) {
      case 'error':
        return 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800';
      case 'info':
        return 'bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800';
      case 'success':
        return 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  }

  /**
   * Get text CSS classes based on message type
   */
  getTextClasses(): string {
    if (!this.message) return '';

    // Using Tailwind classes which map to design tokens via config
    switch (this.message.type) {
      case 'error':
        return 'text-error-800 dark:text-error-200';
      case 'warning':
        return 'text-warning-800 dark:text-warning-200';
      case 'info':
        return 'text-info-800 dark:text-info-200';
      case 'success':
        return 'text-success-800 dark:text-success-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  }

  /**
   * Get button CSS classes based on message type
   */
  getButtonClasses(): string {
    if (!this.message) return '';

    // Using Tailwind classes which map to design tokens via config
    switch (this.message.type) {
      case 'error':
        return 'text-error-500 hover:bg-error-100 focus:ring-error-500';
      case 'warning':
        return 'text-warning-500 hover:bg-warning-100 focus:ring-warning-500';
      case 'info':
        return 'text-info-500 hover:bg-info-100 focus:ring-info-500';
      case 'success':
        return 'text-success-500 hover:bg-success-100 focus:ring-success-500';
      default:
        return 'text-gray-500 hover:bg-gray-100 focus:ring-gray-500';
    }
  }

  /**
   * Get icon based on message type
   */
  getIcon(): string {
    if (!this.message) return '';

    switch (this.message.type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  }

  /**
   * Get message type label for accessibility
   */
  getMessageTypeLabel(): string {
    if (!this.message) return 'Message';
    return `${this.message.type.charAt(0).toUpperCase() + this.message.type.slice(1)} message`;
  }

  /**
   * Handle close button click
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle action button click
   */
  onActionClick(): void {
    if (this.message?.action) {
      this.message.action.handler();
    }
    this.action.emit();
  }
}


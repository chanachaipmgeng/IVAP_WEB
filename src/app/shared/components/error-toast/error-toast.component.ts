/**
 * Error Toast Component
 *
 * A component for displaying error messages as toast notifications.
 * Automatically displays errors from ErrorHandlerService and supports manual dismissal.
 *
 * @example
 * ```html
 * <app-error-toast
 *   [customClass]="'my-error-toast'"
 *   [ariaLabel]="'Error notifications'">
 * </app-error-toast>
 * ```
 */

import { Component, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorHandlerService, ErrorMessage } from '../../../core/services/error-handler.service';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [CommonModule, ErrorMessageComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md" [class]="customClass || ''" role="region" [attr.aria-label]="ariaLabel || 'Error notifications'" [attr.aria-live]="'assertive'" [attr.aria-atomic]="'false'">
      @for (error of errors(); track trackByErrorId($index, error)) {
        <app-error-message
          [message]="error"
          (close)="removeError(error.id)"
          (action)="handleAction(error)"
        />
      }
    </div>
  `,
  styles: []
})
export class ErrorToastComponent {
  /**
   * Error handler service
   */
  private errorHandler = inject(ErrorHandlerService);

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Computed errors from error handler service
   */
  errors = computed(() => this.errorHandler.errors$());

  /**
   * Remove error by ID
   */
  removeError(id: string): void {
    this.errorHandler.removeError(id);
  }

  /**
   * Handle error action
   */
  handleAction(error: ErrorMessage): void {
    if (error.action) {
      error.action.handler();
    }
  }

  /**
   * TrackBy function for errors
   */
  trackByErrorId(index: number, error: ErrorMessage): string {
    return error.id;
  }
}


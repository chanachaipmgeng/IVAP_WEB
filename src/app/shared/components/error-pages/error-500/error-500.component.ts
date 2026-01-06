/**
 * Error 500 Component
 *
 * Displays a 500 Internal Server Error page with error tracking, retry functionality,
 * and navigation options. Includes error ID for support tracking.
 *
 * @example
 * ```html
 * <app-error-500
 *   [customClass]="'my-error-page'"
 *   [ariaLabel]="'Internal server error'">
 * </app-error-500>
 * ```
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-error-500',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './error-500.component.html',
  styleUrls: ['./error-500.component.scss']
})
export class Error500Component implements OnInit {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Unique error ID for tracking
   */
  errorId: string = '';

  /**
   * Retry attempt count
   */
  retryCount: number = 0;

  /**
   * Maximum retry attempts
   */
  maxRetries: number = 3;

  /**
   * Retry in progress
   */
  isRetrying: boolean = false;

  /**
   * Retry delay in milliseconds
   */
  retryDelay: number = 2000; // 2 seconds

  /**
   * Current time
   */
  currentTime: Date = new Date();

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {
    this.generateErrorId();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Log error for debugging
    console.error('500 Internal Server Error - Error ID:', this.errorId);
  }

  /**
   * Generate unique error ID
   */
  generateErrorId(): void {
    this.errorId = 'ERR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Retry loading the page
   */
  retry(): void {
    if (this.retryCount >= this.maxRetries) {
      return;
    }

    this.isRetrying = true;
    this.retryCount++;

    setTimeout(() => {
      this.isRetrying = false;
      // Try to reload the page
      window.location.reload();
    }, this.retryDelay);
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Report issue with error details
   */
  reportIssue(): void {
    // Navigate to issue reporting with error details
    this.router.navigate(['/support/contact'], {
      queryParams: {
        error: '500',
        errorId: this.errorId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get retry delay in seconds
   */
  getRetryDelay(): number {
    return this.retryDelay / 1000;
  }

  /**
   * Check if retry is allowed
   */
  canRetry(): boolean {
    return this.retryCount < this.maxRetries && !this.isRetrying;
  }
}

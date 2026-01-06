/**
 * Error 401 Component
 *
 * Displays a 401 Unauthorized error page when user attempts to access protected resources.
 * Provides navigation options to login page or back to previous page.
 *
 * @example
 * ```html
 * <app-error-401
 *   [customClass]="'my-error-page'"
 *   [ariaLabel]="'Unauthorized access'">
 * </app-error-401>
 * ```
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-error-401',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './error-401.component.html',
  styleUrls: ['./error-401.component.scss']
})
export class Error401Component implements OnInit {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Log unauthorized access attempt
    console.warn('401 Unauthorized - User attempted to access protected resource');
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/portal/login']);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Report issue
   */
  reportIssue(): void {
    this.router.navigate(['/support/contact'], {
      queryParams: {
        error: '401',
        errorType: 'unauthorized'
      }
    });
  }
}


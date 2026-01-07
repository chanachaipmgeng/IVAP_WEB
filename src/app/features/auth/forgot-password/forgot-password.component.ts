/**
 * Forgot Password Component
 *
 * Component for requesting password reset via email.
 * Handles form validation and displays success/error messages.
 *
 * @example
 * ```html
 * <app-forgot-password></app-forgot-password>
 * ```
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    public i18n: I18nService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.loading.set(true);
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success(
          this.i18n.t('pages.forgotPassword.resetLinkSent'),
          this.i18n.t('pages.forgotPassword.resetRequestSent'),
          { timeOut: 5000 }
        );
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/portal/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);
        // Don't reveal if email exists for security
        const errorMessage = err.status === 404
          ? this.i18n.t('pages.forgotPassword.resetLinkSent')
          : this.i18n.t('pages.forgotPassword.errorOccurred');

        if (err.status === 404) {
          this.toastr.info(errorMessage, this.i18n.t('pages.forgotPassword.checkYourEmail'), { timeOut: 5000 });
        } else {
          this.toastr.error(errorMessage, this.i18n.t('common.error'));
        }
      }
    });
  }
}

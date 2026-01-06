/**
 * Reset Password Component
 *
 * Component for resetting user password using a reset token.
 * Validates password match and handles password reset submission.
 *
 * @example
 * ```html
 * <app-reset-password></app-reset-password>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Custom validator to check that two password fields match
 */
function passwordMatchValidator(form: FormGroup) {
  const password = form.get('password');
  const confirmPassword = form.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = signal(false);
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public i18n: I18nService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // รองรับทั้ง URL parameter และ query parameter
    this.token = this.route.snapshot.paramMap.get('token') || 
                 this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.toastr.error(this.i18n.t('pages.resetPassword.invalidToken'), this.i18n.t('pages.resetPassword.error'));
      this.router.navigate(['/portal/login']);
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) return;

    this.loading.set(true);
    const newPassword = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success(this.i18n.t('pages.resetPassword.passwordResetSuccess'), this.i18n.t('pages.resetPassword.success'));
        this.router.navigate(['/portal/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.message || this.i18n.t('pages.resetPassword.failedToReset'), this.i18n.t('pages.resetPassword.error'));
      }
    });
  }
}

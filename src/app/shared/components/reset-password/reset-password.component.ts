/**
 * Reset Password Component
 *
 * A component for resetting user passwords with multi-step flow:
 * email verification, code verification, and password reset.
 *
 * @example
 * ```html
 * <app-reset-password
 *   [customClass]="'my-reset-password'"
 *   [ariaLabel]="'Reset password'">
 * </app-reset-password>
 * ```
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';

/**
 * Password requirement interface
 */
interface PasswordRequirement {
  text: string;
  met: boolean;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;
  resetForm: FormGroup;
  currentStep: 'email' | 'verification' | 'password' | 'success' = 'email';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  verificationCode: string = '';
  email: string = '';
  token: string = '';
  resendCountdown: number = 0;
  passwordStrength: number = 0;
  passwordRequirements: PasswordRequirement[] = [
    { text: 'At least 8 characters', met: false },
    { text: 'Contains uppercase letter', met: false },
    { text: 'Contains lowercase letter', met: false },
    { text: 'Contains number', met: false },
    { text: 'Contains special character', met: false }
  ];

  private countdownSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Check for token in URL (for email link reset)
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        this.currentStep = 'password';
        this.resetForm.patchValue({ password: '', confirmPassword: '' });
      }
    });
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  /**
   * Password match validator
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onEmailSubmit(): void {
    if (this.resetForm.get('email')?.invalid) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.email = this.resetForm.get('email')?.value;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 'verification';
      this.startResendCountdown();
    }, 2000);
  }

  /**
   * Handle verification code submission
   */
  onVerificationSubmit(): void {
    if (this.resetForm.get('verificationCode')?.invalid) {
      this.errorMessage = 'Please enter a valid verification code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.verificationCode = this.resetForm.get('verificationCode')?.value;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 'password';
    }, 1500);
  }

  onPasswordSubmit(): void {
    if (this.resetForm.get('password')?.invalid || this.resetForm.get('confirmPassword')?.invalid) {
      this.errorMessage = 'Please check your password requirements';
      return;
    }

    if (this.resetForm.errors?.['passwordMismatch']) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 'success';
      this.successMessage = 'Your password has been reset successfully';
    }, 2000);
  }

  /**
   * Handle password change
   */
  onPasswordChange(): void {
    const password = this.resetForm.get('password')?.value || '';
    this.checkPasswordStrength(password);
    this.updatePasswordRequirements(password);
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): void {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    this.passwordStrength = strength;
  }

  updatePasswordRequirements(password: string): void {
    this.passwordRequirements[0].met = password.length >= 8;
    this.passwordRequirements[1].met = /[A-Z]/.test(password);
    this.passwordRequirements[2].met = /[a-z]/.test(password);
    this.passwordRequirements[3].met = /[0-9]/.test(password);
    this.passwordRequirements[4].met = /[^A-Za-z0-9]/.test(password);
  }

  /**
   * Resend verification code
   */
  resendVerificationCode(): void {
    if (this.resendCountdown > 0) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.startResendCountdown();
    }, 1000);
  }

  startResendCountdown(): void {
    this.resendCountdown = 60;
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.countdownSubscription?.unsubscribe();
      }
    });
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    switch (this.currentStep) {
      case 'verification':
        this.currentStep = 'email';
        break;
      case 'password':
        this.currentStep = 'verification';
        break;
      case 'success':
        this.currentStep = 'password';
        break;
    }
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Get password strength color class
   */
  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return 'weak';
    if (this.passwordStrength < 80) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 40) return 'Weak';
    if (this.passwordStrength < 80) return 'Medium';
    return 'Strong';
  }

  /**
   * Check if code can be resent
   */
  canResendCode(): boolean {
    return this.resendCountdown === 0 && !this.isLoading;
  }

  /**
   * Get current step title
   */
  getStepTitle(): string {
    switch (this.currentStep) {
      case 'email':
        return 'Reset Password';
      case 'verification':
        return 'Verify Email';
      case 'password':
        return 'Set New Password';
      case 'success':
        return 'Password Reset';
      default:
        return 'Reset Password';
    }
  }

  /**
   * Get current step description
   */
  getStepDescription(): string {
    switch (this.currentStep) {
      case 'email':
        return 'Enter your email address and we\'ll send you a verification code';
      case 'verification':
        return 'Enter the verification code sent to your email';
      case 'password':
        return 'Create a new password for your account';
      case 'success':
        return 'Your password has been successfully reset';
      default:
        return '';
    }
  }
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}


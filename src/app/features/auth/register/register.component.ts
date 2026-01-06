/**
 * Register Component
 *
 * User registration component with multi-step form (info, verification, success).
 * Supports password strength validation, email verification, and theme/language switching.
 *
 * @example
 * ```html
 * <app-register></app-register>
 * ```
 */

import { Component, OnInit, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Registration form interface
 */
export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent extends BaseComponent implements OnInit {
  loading = signal(false);
  currentStep = signal<'info' | 'verification' | 'success'>('info');
  passwordStrength = signal(0);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  formData: RegisterForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  // Verification
  verificationCode = '';
  resendCountdown = signal(0);
  canResend = signal(false);

  // Password requirements
  passwordRequirements = signal({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  currentTheme = signal('light');
  currentLang = signal('en');

  constructor(
    private router: Router,
    private auth: AuthService,
    private api: ApiService,
    public theme: ThemeService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    // Watch theme changes
    effect(() => {
      const isDark = this.theme.isDark();
      this.currentTheme.set(isDark ? 'dark' : 'light');
      this.cdr.detectChanges();
    });

    // Watch language changes
    effect(() => {
      const lang = this.i18n.currentLanguage();
      this.currentLang.set(lang);
    });
  }

  ngOnInit(): void {
    // Initialize countdown
    this.startResendCountdown();
  }

  startResendCountdown(): void {
    this.resendCountdown.set(60);
    this.canResend.set(false);

    const countdown = setInterval(() => {
      if (this.resendCountdown() > 0) {
        this.resendCountdown.set(this.resendCountdown() - 1);
      } else {
        clearInterval(countdown);
        this.canResend.set(true);
      }
    }, 1000);
  }

  checkPasswordStrength(password: string): void {
    let strength = 0;
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };

    this.passwordRequirements.set(requirements);

    if (requirements.minLength) strength += 20;
    if (requirements.hasUppercase) strength += 20;
    if (requirements.hasLowercase) strength += 20;
    if (requirements.hasNumber) strength += 20;
    if (requirements.hasSpecial) strength += 20;

    this.passwordStrength.set(strength);
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    if (strength < 40) return 'weak';
    if (strength < 80) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Medium';
    return 'Strong';
  }

  validateForm(): boolean {
    if (!this.formData.firstName || !this.formData.lastName) {
      alert('Please enter your name');
      return false;
    }

    if (!this.formData.email || !this.isValidEmail(this.formData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!this.formData.password || this.passwordStrength() < 50) {
      alert('Password is too weak. Please choose a stronger password.');
      return false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }

    if (!this.formData.acceptTerms) {
      alert('Please accept the Terms and Conditions');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);

    // เรียกใช้ auth.register() จริง
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.auth.register({
        username: this.formData.email, // ใช้ email เป็น username
        password: this.formData.password,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        email: this.formData.email,
        actorType: 'member', // ตั้งค่า default เป็น member
        memberType: 'employee', // ตั้งค่า default เป็น employee
        phoneNumber: '' // ถ้ามี field phone number ใน form
      }),
      (user) => {
        this.loading.set(false);
        this.currentStep.set('verification');
        this.startResendCountdown();
      },
      (error) => {
        this.loading.set(false);
        const errorMsg = error?.error?.error?.message || 
                        error?.error?.message || 
                        error?.message || 
                        'Registration failed. Please try again.';
        alert(errorMsg);
      }
    );
  }

  onVerificationSubmit(): void {
    if (!this.verificationCode || this.verificationCode.length < 6) {
      alert('Please enter a valid verification code');
      return;
    }

    this.loading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
      this.currentStep.set('success');
    }, 1000);
  }

  resendCode(): void {
    if (!this.canResend()) {
      return;
    }

    this.loading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
      this.startResendCountdown();
    }, 500);
  }

  goToLogin(): void {
    this.router.navigate(['/portal/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  goBack(): void {
    if (this.currentStep() === 'verification') {
      this.currentStep.set('info');
    }
  }

  toggleTheme(): void {
    this.theme.toggleMode();
    const isDark = this.theme.isDark();
    this.currentTheme.set(isDark ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  getThemeIcon(): string {
    const mode = this.theme.mode();
    const isDark = this.theme.isDark();
    
    if (mode === 'auto') {
      return isDark ? '🌙' : '☀️';
    }
    return mode === 'dark' ? '🌙' : '☀️';
  }

  getThemeLabel(): string {
    const mode = this.theme.mode();
    return this.i18n.t(`theme.${mode}`);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
    this.currentLang.set(this.i18n.currentLanguage());
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}


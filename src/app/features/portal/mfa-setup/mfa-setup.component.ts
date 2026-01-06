/**
 * MFA Setup Component
 *
 * Component for setting up multi-factor authentication (MFA).
 * Supports QR code generation, secret key display, backup codes, and verification.
 *
 * @example
 * ```html
 * <app-mfa-setup></app-mfa-setup>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../../shared/components/glass-input/glass-input.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MultiFactorVerificationService } from '../../../core/services/multi-factor-verification.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

/**
 * MFA setup interface
 */
interface MFASetup {
  qrCode: string;
  secretKey: string;
  backupCodes: string[];
}

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    GlassInputComponent,
    LoadingComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './mfa-setup.component.html',
  styleUrl: './mfa-setup.component.scss'
})
export class MfaSetupComponent implements OnInit {
  mfaSetup = signal<MFASetup | null>(null);
  verificationForm: FormGroup;
  loading = signal(false);
  verifying = signal(false);
  step = signal<'setup' | 'verify' | 'complete'>('setup');
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private mfaService: MultiFactorVerificationService,
    private auth: AuthService,
    public router: Router,
    private i18n: I18nService
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadMFASetup();
  }

  loadMFASetup(): void {
    this.loading.set(true);
    this.mfaService.generateTOTPSecret().subscribe({
      next: (response) => {
        // Generate backup codes
        const backupCodes = this.generateBackupCodes();
        this.mfaSetup.set({
          qrCode: response.qrCode,
          secretKey: response.secret,
          backupCodes: backupCodes
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading MFA setup:', error);
        this.errorMessage.set('Failed to load MFA setup. Please try again.');
        this.loading.set(false);
      }
    });
  }

  verifyCode(): void {
    if (this.verificationForm.invalid) return;

    this.verifying.set(true);
    this.errorMessage.set('');

    const code = this.verificationForm.get('code')?.value;
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || !currentUser.id || !currentUser.companyId) {
      this.errorMessage.set('User information not found. Please log in again.');
      this.verifying.set(false);
      return;
    }

    const verificationRequest = {
      member_id: currentUser.id,
      company_id: currentUser.companyId,
      method: 'totp',
      code: code
    };

    this.mfaService.verifyTOTPCode(verificationRequest).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.step.set('complete');
          this.verifying.set(false);
          // Redirect to dashboard after successful setup
          setTimeout(() => {
            this.router.navigate(['/portal/dashboard']);
          }, 2000);
        } else {
          this.errorMessage.set('Invalid verification code. Please try again.');
          this.verifying.set(false);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Invalid verification code. Please try again.');
        this.verifying.set(false);
      }
    });
  }

  skipMFA(): void {
    this.router.navigate(['/portal/dashboard']);
  }

  /**
   * Check if image URL is Base64 encoded
   */
  isBase64Image(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('data:image/') || url.startsWith('data:image/svg+xml');
  }

  downloadBackupCodes(): void {
    const codes = this.mfaSetup()?.backupCodes || [];
    const content = codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character backup code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

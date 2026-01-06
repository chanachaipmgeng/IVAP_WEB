/**
 * Login Component
 *
 * User authentication component for portal login.
 * Supports username/password authentication, language switching, and theme toggling.
 *
 * @example
 * ```html
 * <app-login></app-login>
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
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  currentLang = signal('en');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public i18n: I18nService,
    private theme: ThemeService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Initialize current language after i18n is available
    this.currentLang.set(this.i18n.currentLanguage());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.auth.login(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        // Get redirect path based on user role/type
        const redirectPath = this.auth.getRedirectPath();
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        this.loading.set(false);
        // Extract error message from response
        const errorMsg = error?.error?.error?.message || 
                        error?.error?.message || 
                        error?.message || 
                        this.i18n.t('login.loginFailed');
        this.errorMessage.set(errorMsg);
      }
    });
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
    this.currentLang.set(this.i18n.currentLanguage());
  }

  toggleTheme(): void {
    this.theme.toggleMode();
  }

  getThemeIcon(): string {
    const themeValue = this.theme.mode();
    return themeValue === 'light' ? '☀️ Light' : themeValue === 'dark' ? '🌙 Dark' : '💻 Auto';
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}


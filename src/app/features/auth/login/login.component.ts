/**
 * Login Component
 *
 * User authentication component for portal login.
 * Supports username/password authentication and theme toggling.
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
import { ToastrService } from 'ngx-toastr';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { AuthService } from '../../../core/services/auth.service';
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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private theme: ThemeService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
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
        this.toastr.success('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับ');

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
                        'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน';
        this.errorMessage.set(errorMsg);
        this.toastr.error(errorMsg, 'เข้าสู่ระบบไม่สำเร็จ');
      }
    });
  }

  toggleTheme(): void {
    this.theme.toggleMode();
  }

  getThemeIcon(): string {
    const themeValue = this.theme.mode();
    return themeValue === 'light' ? '☀️ สว่าง' : themeValue === 'dark' ? '🌙 มืด' : '💻 อัตโนมัติ';
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}

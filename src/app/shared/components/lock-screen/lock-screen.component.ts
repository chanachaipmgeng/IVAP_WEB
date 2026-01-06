/**
 * Lock Screen Component
 *
 * A component for displaying a lock screen with password unlock functionality.
 * Supports lockout after failed attempts, countdown timers, and user information display.
 *
 * @example
 * ```html
 * <app-lock-screen
 *   [isLocked]="true"
 *   [lockReason]="'Session expired'"
 *   [userInfo]="userInfo"
 *   [ariaLabel]="'Lock screen'"
 *   (unlock)="onUnlock($event)">
 * </app-lock-screen>
 * ```
 */

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

/**
 * User info interface
 */
interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    RouterModule,
    ImageOptimizationDirective
  ],
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.scss']
})
export class LockScreenComponent implements OnInit, OnDestroy {
  /**
   * Locked state
   */
  @Input() isLocked: boolean = true;

  /**
   * Lock reason message
   */
  @Input() lockReason: string = 'Session expired';

  /**
   * User information
   */
  @Input() userInfo: UserInfo = {
    name: 'User',
    email: 'user@example.com'
  };

  /**
   * Lock duration in minutes (0 = indefinite)
   */
  @Input() lockDuration: number = 0;

  /**
   * Maximum unlock attempts
   */
  @Input() maxAttempts: number = 5;

  /**
   * Lockout duration in minutes
   */
  @Input() lockoutDuration: number = 15;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Unlock event
   */
  @Output() unlock = new EventEmitter<string>();

  /**
   * Logout event
   */
  @Output() logout = new EventEmitter<void>();

  /**
   * Forgot password event
   */
  @Output() forgotPassword = new EventEmitter<void>();

  password: string = '';
  confirmPassword: string = '';
  currentAttempts: number = 0;
  isLockedOut: boolean = false;
  lockoutTimeRemaining: number = 0;
  isUnlocking: boolean = false;
  showPassword: boolean = false;
  currentTime: Date = new Date();
  lockTime: Date = new Date();
  timeRemaining: string = '';

  private timerSubscription?: Subscription;
  private lockoutSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startTimer();
    this.checkLockoutStatus();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.lockoutSubscription) {
      this.lockoutSubscription.unsubscribe();
    }
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
      this.updateTimeRemaining();
    });
  }

  /**
   * Update time remaining
   */
  updateTimeRemaining(): void {
    if (this.lockDuration > 0) {
      const elapsed = (this.currentTime.getTime() - this.lockTime.getTime()) / (1000 * 60);
      const remaining = Math.max(0, this.lockDuration - elapsed);

      if (remaining <= 0) {
        this.isLocked = false;
        this.unlock.emit('timeout');
        return;
      }

      const hours = Math.floor(remaining / 60);
      const minutes = Math.floor(remaining % 60);
      this.timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  checkLockoutStatus(): void {
    const lockoutEnd = localStorage.getItem('lockoutEnd');
    if (lockoutEnd) {
      const lockoutTime = new Date(lockoutEnd);
      if (this.currentTime < lockoutTime) {
        this.isLockedOut = true;
        this.lockoutTimeRemaining = Math.ceil((lockoutTime.getTime() - this.currentTime.getTime()) / (1000 * 60));
        this.startLockoutTimer();
      } else {
        localStorage.removeItem('lockoutEnd');
        localStorage.removeItem('attempts');
      }
    }

    const attempts = localStorage.getItem('attempts');
    if (attempts) {
      this.currentAttempts = parseInt(attempts);
    }
  }

  /**
   * Start lockout timer
   */
  startLockoutTimer(): void {
    this.lockoutSubscription = interval(1000).subscribe(() => {
      const lockoutEnd = localStorage.getItem('lockoutEnd');
      if (lockoutEnd) {
        const lockoutTime = new Date(lockoutEnd);
        if (this.currentTime >= lockoutTime) {
          this.isLockedOut = false;
          this.lockoutTimeRemaining = 0;
          localStorage.removeItem('lockoutEnd');
          if (this.lockoutSubscription) {
            this.lockoutSubscription.unsubscribe();
          }
        } else {
          this.lockoutTimeRemaining = Math.ceil((lockoutTime.getTime() - this.currentTime.getTime()) / (1000 * 60));
        }
      }
    });
  }

  /**
   * Handle unlock attempt
   */
  onUnlock(): void {
    if (this.isLockedOut) {
      return;
    }

    if (!this.password.trim()) {
      return;
    }

    this.isUnlocking = true;

    // Simulate unlock process
    setTimeout(() => {
      this.isUnlocking = false;

      // Check if password is correct (in real app, validate with backend)
      if (this.validatePassword(this.password)) {
        this.currentAttempts = 0;
        localStorage.removeItem('attempts');
        localStorage.removeItem('lockoutEnd');
        this.unlock.emit(this.password);
      } else {
        this.handleFailedAttempt();
      }
    }, 1000);
  }

  validatePassword(password: string): boolean {
    // In a real app, this would validate with the backend
    // For demo purposes, accept any password longer than 3 characters
    return password.length >= 4;
  }

  handleFailedAttempt(): void {
    this.currentAttempts++;
    localStorage.setItem('attempts', this.currentAttempts.toString());

    if (this.currentAttempts >= this.maxAttempts) {
      this.isLockedOut = true;
      const lockoutEnd = new Date(this.currentTime.getTime() + this.lockoutDuration * 60 * 1000);
      localStorage.setItem('lockoutEnd', lockoutEnd.toISOString());
      this.startLockoutTimer();
    }

    this.password = '';
    this.showPassword = false;
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    this.logout.emit();
  }

  /**
   * Handle forgot password
   */
  onForgotPassword(): void {
    this.forgotPassword.emit();
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onUnlock();
    }
  }

  /**
   * Get remaining unlock attempts
   */
  getRemainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.currentAttempts);
  }

  /**
   * Get lockout time remaining as string
   */
  getLockoutTimeRemaining(): string {
    const hours = Math.floor(this.lockoutTimeRemaining / 60);
    const minutes = this.lockoutTimeRemaining % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Check if unlock can be attempted
   */
  canAttemptUnlock(): boolean {
    return !this.isLockedOut && this.getRemainingAttempts() > 0;
  }

  /**
   * Get status message
   */
  getStatusMessage(): string {
    if (this.isLockedOut) {
      return `Account locked. Try again in ${this.getLockoutTimeRemaining()}`;
    }
    if (this.currentAttempts > 0) {
      return `${this.getRemainingAttempts()} attempts remaining`;
    }
    return this.lockReason;
  }

  /**
   * Get status color
   */
  getStatusColor(): string {
    if (this.isLockedOut) {
      return 'error';
    }
    if (this.currentAttempts > 0) {
      return 'warning';
    }
    return 'info';
  }
}


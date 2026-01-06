/**
 * Coming Soon Component
 *
 * Displays a coming soon page with countdown timer and email subscription form.
 * Shows time remaining until launch and allows users to subscribe for updates.
 *
 * @example
 * ```html
 * <app-coming-soon
 *   [customClass]="'my-coming-soon-page'"
 *   [ariaLabel]="'Coming soon'">
 * </app-coming-soon>
 * ```
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Target launch date
   */
  targetDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  /**
   * Current time
   */
  currentTime: Date = new Date();

  /**
   * Days remaining
   */
  days: number = 0;

  /**
   * Hours remaining
   */
  hours: number = 0;

  /**
   * Minutes remaining
   */
  minutes: number = 0;

  /**
   * Seconds remaining
   */
  seconds: number = 0;

  /**
   * Email subscription
   */
  email: string = '';

  /**
   * Form submitted state
   */
  submitted: boolean = false;

  /**
   * Timer subscription
   */
  private timerSubscription?: Subscription;

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.startTimer();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  /**
   * Start countdown timer
   */
  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
      this.calculateCountdown();
    });
  }

  /**
   * Calculate countdown values
   */
  calculateCountdown(): void {
    const diff = this.targetDate.getTime() - this.currentTime.getTime();

    if (diff <= 0) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      return;
    }

    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  /**
   * Handle email subscription submit
   */
  onEmailSubmit(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      return;
    }

    // Simulate API call to subscribe
    this.submitted = true;

    // Reset after 3 seconds
    setTimeout(() => {
      this.submitted = false;
      this.email = '';
    }, 3000);
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }
}


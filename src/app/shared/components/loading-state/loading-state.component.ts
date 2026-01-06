/**
 * Loading State Component
 *
 * A component for displaying loading states with various animation types.
 * Supports spinner, dots, skeleton, pulse, and bars animations.
 *
 * @example
 * ```html
 * <app-loading-state
 *   [type]="'spinner'"
 *   [message]="'Loading...'"
 *   [fullScreen]="false"
 *   [ariaLabel]="'Loading content'">
 * </app-loading-state>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOut, pulseAnimation } from '../../../core/animations/animations';

/**
 * Loading type options
 */
export type LoadingType = 'spinner' | 'dots' | 'skeleton' | 'pulse' | 'bars';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInOut, pulseAnimation],
  template: `
    <div class="loading-container" [class.full-screen]="fullScreen" [class]="customClass || ''" role="status" [attr.aria-label]="ariaLabel || message || 'Loading'" [attr.aria-live]="'polite'" [attr.aria-busy]="'true'" @fadeInOut>
      @switch (type) {
        @case ('spinner') {
          <div class="spinner-wrapper">
            <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
            @if (message) {
              <p class="loading-message">{{ message }}</p>
            }
          </div>
        }
        @case ('dots') {
          <div class="dots-wrapper">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            @if (message) {
              <p class="loading-message">{{ message }}</p>
            }
          </div>
        }
        @case ('bars') {
          <div class="bars-wrapper">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            @if (message) {
              <p class="loading-message">{{ message }}</p>
            }
          </div>
        }
        @case ('skeleton') {
          <div class="skeleton-wrapper" [attr.aria-hidden]="true">
            @for (line of skeletonLines; track trackBySkeletonLine($index, line)) {
              <div class="skeleton-line" [style.width.%]="line"></div>
            }
          </div>
        }
        @case ('pulse') {
          <div class="pulse-wrapper" @pulseAnimation>
            <div class="pulse-circle" [style.width.px]="size" [style.height.px]="size"></div>
            @if (message) {
              <p class="loading-message">{{ message }}</p>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .loading-container.full-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
    }

    /* Spinner */
    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      border: 3px solid rgba(var(--color-primary-rgb), 0.2);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Dots - Using Design Tokens */
    .dots-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm); /* 8px */
      flex-direction: column;
    }

    .dots-wrapper > div:first-child {
      display: flex;
      gap: var(--spacing-sm); /* 8px */
    }

    .dot {
      width: 0.75rem;
      height: 0.75rem;
      background: var(--color-primary-500);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
      animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
      animation-delay: -0.16s;
    }

    /* Bars */
    .bars-wrapper {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex-direction: column;
    }

    .bars-wrapper > div:first-child {
      display: flex;
      gap: 0.375rem;
    }

    .bar {
      width: 0.25rem;
      height: 2rem;
      background: var(--color-primary);
      border-radius: 0.125rem;
      animation: bars 1.2s ease-in-out infinite;
    }

    .bar:nth-child(1) {
      animation-delay: -1.2s;
    }

    .bar:nth-child(2) {
      animation-delay: -1.1s;
    }

    .bar:nth-child(3) {
      animation-delay: -1.0s;
    }

    .bar:nth-child(4) {
      animation-delay: -0.9s;
    }

    /* Skeleton - Using Design Tokens */
    .skeleton-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: calc(var(--spacing-sm) + var(--spacing-xs)); /* 12px */
    }

    .skeleton-line {
      height: 1rem;
      background: linear-gradient(
        90deg,
        rgba(59, 130, 246, 0.1) 25%, /* primary-500 with opacity */
        rgba(59, 130, 246, 0.2) 50%,
        rgba(59, 130, 246, 0.1) 75%
      );
      background-size: 200% 100%;
      border-radius: var(--radius-md); /* 8px */
      animation: shimmer 1.5s infinite;
    }

    /* Pulse */
    .pulse-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .pulse-circle {
      background: var(--color-primary);
      border-radius: 50%;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Message - Using Design Tokens */
    .loading-message {
      margin: 0;
      color: var(--color-textPrimary);
      font-size: var(--font-size-sm); /* 14px */
      font-weight: var(--font-weight-medium); /* 500 */
      text-align: center;
    }

    .full-screen .loading-message {
      color: white;
    }

    /* Animations */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    @keyframes bars {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class LoadingStateComponent {
  /**
   * Loading animation type
   */
  @Input() type: LoadingType = 'spinner';

  /**
   * Size of the loading indicator in pixels
   */
  @Input() size: number = 48;

  /**
   * Loading message to display
   */
  @Input() message?: string;

  /**
   * Display as full screen overlay
   */
  @Input() fullScreen: boolean = false;

  /**
   * Skeleton line widths (percentage)
   */
  @Input() skeletonLines: number[] = [100, 90, 95, 80];

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * TrackBy function for skeleton lines
   */
  trackBySkeletonLine(index: number, line: number): number {
    return index;
  }
}


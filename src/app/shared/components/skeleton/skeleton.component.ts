/**
 * Skeleton Component
 *
 * Displays skeleton loading placeholders for content that is being loaded.
 * Supports multiple types: text, avatar, card, button, or custom items.
 *
 * @example
 * ```html
 * <app-skeleton type="text" [count]="3"></app-skeleton>
 * <app-skeleton type="card" [count]="2"></app-skeleton>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton item interface
 */
export interface SkeletonItem {
  width: string;
  height: string;
  margin?: string;
}

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-container"
      [ngClass]="containerClass || customClass"
      role="status"
      [attr.aria-label]="ariaLabel || 'Loading content'"
      [attr.aria-busy]="true"
      [attr.aria-live]="ariaLive">
      <div
        *ngFor="let item of skeletonItems; trackBy: trackByItem"
        class="skeleton-item"
        [ngClass]="itemClass"
        [style.width]="item.width"
        [style.height]="item.height"
        [style.margin]="item.margin"
        [attr.aria-hidden]="true"
      ></div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md); /* 16px */
    }

    .skeleton-item {
      background: linear-gradient(90deg,
        rgba(59, 130, 246, 0.1) 25%, /* primary-500 with opacity */
        rgba(59, 130, 246, 0.2) 50%,
        rgba(59, 130, 246, 0.1) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: var(--radius-lg); /* 12px */
    }

    .skeleton-text {
      height: 1rem;
      width: 100%;
    }

    .skeleton-text.short {
      width: 60%;
    }

    .skeleton-text.medium {
      width: 80%;
    }

    .skeleton-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
    }

    .skeleton-card {
      height: 200px;
      width: 100%;
      border-radius: var(--radius-xl); /* 16px */
    }

    .skeleton-button {
      height: 2.5rem;
      width: 120px;
      border-radius: var(--radius-md); /* 8px */
    }

    @keyframes skeleton-loading {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class SkeletonComponent {
  /**
   * Skeleton type
   */
  @Input() type: 'text' | 'avatar' | 'card' | 'button' | 'custom' = 'text';

  /**
   * Number of skeleton items to display
   */
  @Input() count: number = 1;

  /**
   * Container CSS classes
   */
  @Input() containerClass: string = '';

  /**
   * Item CSS classes
   */
  @Input() itemClass: string = '';

  /**
   * Custom skeleton items
   */
  @Input() customItems: SkeletonItem[] = [];

  /**
   * Custom CSS classes (alternative to containerClass)
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA live region setting
   */
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'polite';

  /**
   * Get skeleton items based on type and count
   */
  get skeletonItems(): SkeletonItem[] {
    if (this.customItems.length > 0) {
      return this.customItems;
    }

    const items: SkeletonItem[] = [];
    for (let i = 0; i < this.count; i++) {
      switch (this.type) {
        case 'text':
          items.push({
            width: '100%',
            height: '1rem',
            margin: '0.5rem 0'
          });
          break;
        case 'avatar':
          items.push({
            width: '3rem',
            height: '3rem',
            margin: '0.5rem'
          });
          break;
        case 'card':
          items.push({
            width: '100%',
            height: '200px',
            margin: '1rem 0'
          });
          break;
        case 'button':
          items.push({
            width: '120px',
            height: '2.5rem',
            margin: '0.5rem'
          });
          break;
        default:
          items.push({
            width: '100%',
            height: '1rem',
            margin: '0.5rem 0'
          });
      }
    }
    return items;
  }

  /**
   * TrackBy function for skeleton items
   */
  trackByItem(index: number, item: SkeletonItem): string {
    return `${item.width}-${item.height}-${index}`;
  }
}








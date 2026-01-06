/**
 * Page Layout Component
 *
 * A flexible page layout component with header, breadcrumb, title, description, actions, and footer.
 * Provides consistent page structure across the application.
 *
 * @example
 * ```html
 * <app-page-layout
 *   title="Dashboard"
 *   description="Overview of your analytics"
 *   [breadcrumb]="breadcrumbItems"
 *   [actions]="pageActions">
 *   <div>Page content goes here</div>
 * </app-page-layout>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { fadeIn, slideInDown } from '../../../core/animations/animations';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

export interface PageAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, GlassButtonComponent],
  animations: [fadeIn, slideInDown],
  template: `
    <div class="page-layout" @fadeIn [ngClass]="customClass" [attr.aria-label]="ariaLabel || title">
      <!-- Page Header -->
      <header class="page-header" @slideInDown role="banner">
        <!-- Breadcrumb -->
        @if (breadcrumb && breadcrumb.length > 0) {
          <nav class="breadcrumb" [attr.aria-label]="'Breadcrumb navigation'">
            @for (item of breadcrumb; track trackByBreadcrumb($index, item); let isLast = $last) {
              @if (item.link && !isLast) {
                <a
                  [href]="item.link"
                  class="breadcrumb-item"
                  [attr.aria-label]="'Navigate to ' + item.label">
                  @if (item.icon) {
                    <span class="breadcrumb-icon" aria-hidden="true">{{ item.icon }}</span>
                  }
                  {{ item.label }}
                </a>
                <span class="breadcrumb-separator" aria-hidden="true">›</span>
              } @else {
                <span class="breadcrumb-item current" [attr.aria-current]="isLast ? 'page' : null">
                  @if (item.icon) {
                    <span class="breadcrumb-icon" aria-hidden="true">{{ item.icon }}</span>
                  }
                  {{ item.label }}
                </span>
              }
            }
          </nav>
        }

        <!-- Title & Description -->
        <div class="header-content">
          <div class="title-section">
            @if (icon) {
              <span class="page-icon">{{ icon }}</span>
            }
            <div>
              <h1 class="page-title">{{ title }}</h1>
              @if (subtitle) {
                <p class="page-description">{{ subtitle }}</p>
              } @else if (description) {
                <p class="page-description">{{ description }}</p>
              }
            </div>
          </div>

          <!-- Actions -->
          @if (actions && actions.length > 0) {
            <div class="actions-section" role="toolbar" [attr.aria-label]="'Page actions'">
              @for (action of actions; track trackByAction($index, action)) {
                <app-glass-button
                  [variant]="action.variant || 'primary'"
                  [disabled]="action.disabled || false"
                  [loading]="action.loading || false"
                  [ariaLabel]="action.label"
                  (clicked)="action.onClick()"
                >
                  @if (action.icon) {
                    <span aria-hidden="true">{{ action.icon }}</span>
                  }
                  {{ action.label }}
                </app-glass-button>
              }
            </div>
          }
        </div>

        <!-- Custom Header Content -->
        <div class="header-extra">
          <ng-content select="[header]"></ng-content>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content" role="main">
        <ng-content></ng-content>
      </main>

      <!-- Page Footer -->
      @if (showFooter) {
        <footer class="page-footer" role="contentinfo">
          <ng-content select="[footer]"></ng-content>
        </footer>
      }
    </div>
  `,
  styles: [`
    .page-layout {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      margin-bottom: 1.5rem; /* mb-6 (24px) */
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem; /* text-sm */
      flex-wrap: wrap;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: rgb(100 116 139); /* slate-500 */
      text-decoration: none;
      transition: color 0.2s ease;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .breadcrumb-item:hover {
      color: rgb(37 99 235); /* blue-600 */
      background: rgba(37, 99, 235, 0.05);
    }

    .breadcrumb-item.current {
      color: rgb(15 23 42); /* slate-900 */
      font-weight: 600;
    }

    .breadcrumb-icon {
      font-size: 1rem;
    }

    .breadcrumb-separator {
      color: rgb(100 116 139); /* slate-500 */
      opacity: 0.5;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .title-section {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
    }

    .page-icon {
      font-size: 2.5rem;
      line-height: 1;
      padding: 0.75rem;
      background: linear-gradient(135deg, rgb(37 99 235), rgb(59 130 246));
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-title {
      /* H1 / Title: text-4xl font-bold (36px, 700) */
      font-size: 2.25rem; /* text-4xl */
      font-weight: 700; /* font-bold */
      color: rgb(15 23 42); /* slate-900 */
      margin: 0;
      line-height: 1.375; /* leading-snug */
      margin-bottom: 1.5rem; /* mb-6 (24px) */
    }

    .page-description {
      margin: 0.5rem 0 0 0;
      color: rgb(51 65 85); /* slate-700 */
      font-size: 1rem; /* text-base */
      line-height: 1.625; /* leading-relaxed */
      max-width: 600px;
    }

    .actions-section {
      display: flex;
      gap: 1rem; /* space-x-4 (16px) */
      flex-wrap: wrap;
      align-items: center;
    }

    .header-extra {
      width: 100%;
      margin-top: 1rem;
    }

    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem; /* mb-8 (32px) ระหว่าง sections */
    }

    .page-footer {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(148, 163, 184, 0.2); /* slate-300 with opacity */
    }

    .loading-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.5rem;
      }

      .page-icon {
        font-size: 2rem;
        padding: 0.5rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .actions-section {
        width: 100%;
      }
    }
  `]
})
export class PageLayoutComponent {
  /**
   * Page title
   * @default ''
   */
  @Input() title: string = '';

  /**
   * Page description
   */
  @Input() description?: string;

  /**
   * Page icon (emoji or icon class)
   */
  @Input() icon?: string;

  /**
   * Breadcrumb items
   */
  @Input() breadcrumb?: BreadcrumbItem[];

  /**
   * Page action buttons
   */
  @Input() actions?: PageAction[];

  /**
   * Whether to show footer
   * @default false
   */
  @Input() showFooter: boolean = false;

  /**
   * Page subtitle (alternative to description)
   */
  @Input() subtitle?: string;

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for page layout
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * TrackBy function for breadcrumb items
   */
  trackByBreadcrumb(index: number, item: BreadcrumbItem): string {
    return item.label + (item.link || '') + index;
  }

  /**
   * TrackBy function for action buttons
   */
  trackByAction(index: number, action: PageAction): string {
    return action.label + index;
  }
}


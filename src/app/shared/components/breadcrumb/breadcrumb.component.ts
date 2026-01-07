/**
 * Breadcrumb Component
 *
 * A navigation breadcrumb component for showing the current page location.
 * Supports icons, separators, and custom styling with accessibility features.
 *
 * @example
 * ```html
 * <app-breadcrumb
 *   [items]="breadcrumbItems"
 *   separator="icon"
 *   size="md">
 * </app-breadcrumb>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  label: string;
  route?: string | unknown[];
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav
      [class]="getBreadcrumbClasses()"
      role="navigation"
      [attr.aria-label]="ariaLabel || 'Breadcrumb'">
      <ol class="breadcrumb-list" role="list">
        @for (item of items; track trackByItem($index, item); let last = $last; let i = $index) {
          <li
            [class]="getItemClasses(item, last)"
            role="listitem"
            [attr.aria-current]="last ? 'page' : null">
            
            @if (!last && item.route && !item.disabled) {
              <a
                [routerLink]="item.route"
                [class]="linkClass"
                [attr.aria-label]="item.label">
                @if (item.icon) {
                  <mat-icon [class]="iconClass" [attr.aria-hidden]="true">{{ item.icon }}</mat-icon>
                }
                <span>{{ item.label }}</span>
              </a>
            }
            
            @if (last || !item.route || item.disabled) {
              <span
                [class]="getSpanClasses(item, last)"
                [attr.aria-label]="item.label">
                @if (item.icon) {
                  <mat-icon [class]="iconClass" [attr.aria-hidden]="true">{{ item.icon }}</mat-icon>
                }
                <span>{{ item.label }}</span>
              </span>
            }
            
            @if (!last && separator === 'icon') {
              <mat-icon
                [class]="separatorClass"
                [attr.aria-hidden]="true"
                [attr.aria-label]="'Separator'">
                {{ separatorIcon }}
              </mat-icon>
            }
            
            @if (!last && separator === 'text') {
              <span
                [class]="separatorClass"
                [attr.aria-hidden]="true">
                {{ separatorText }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    nav {
      @apply flex items-center;
    }

    .breadcrumb-list {
      @apply flex flex-wrap items-center list-none m-0 p-0 gap-2;
    }

    li {
      @apply flex items-center gap-2;
    }

    a, span {
      @apply inline-flex items-center gap-1 no-underline text-inherit transition-colors duration-150;
    }

    a {
      @apply text-gray-500 hover:text-primary-500;
    }

    .breadcrumb-item-active {
      @apply text-gray-900 font-medium;
    }

    .breadcrumb-item-disabled {
      @apply text-gray-400 cursor-not-allowed;
    }

    /* Separator - Using Design Tokens */
    .breadcrumb-separator {
      @apply text-gray-400 select-none;
    }

    mat-icon.breadcrumb-separator {
      @apply text-base w-4 h-4;
    }

    /* Icons */
    mat-icon {
      @apply text-base w-4 h-4;
    }

    /* Variants - Using Design Tokens */
    .breadcrumb-sm {
      @apply text-sm;
    }

    .breadcrumb-md {
      @apply text-base;
    }

    .breadcrumb-lg {
      @apply text-lg;
    }
  `]
})
export class BreadcrumbComponent {
  /**
   * Breadcrumb items
   */
  @Input() items: BreadcrumbItem[] = [];

  /**
   * Separator type
   */
  @Input() separator: 'text' | 'icon' | 'slash' = 'icon';

  /**
   * Separator text
   */
  @Input() separatorText: string = '/';

  /**
   * Separator icon
   */
  @Input() separatorIcon: string = 'chevron_right';

  /**
   * Breadcrumb size
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Link CSS classes
   */
  @Input() linkClass: string = '';

  /**
   * Icon CSS classes
   */
  @Input() iconClass: string = '';

  /**
   * Separator CSS classes
   */
  @Input() separatorClass: string = 'breadcrumb-separator';

  /**
   * ARIA label for the breadcrumb
   */
  @Input() ariaLabel: string = '';

  /**
   * Get breadcrumb CSS classes
   */
  getBreadcrumbClasses(): string {
    const classes = ['breadcrumb'];
    classes.push(`breadcrumb-${this.size}`);
    if (this.customClass) {
      classes.push(this.customClass);
    }
    return classes.join(' ');
  }

  /**
   * Get item CSS classes
   */
  getItemClasses(item: BreadcrumbItem, last: boolean): string {
    const classes = ['breadcrumb-item'];
    if (last) {
      classes.push('breadcrumb-item-active');
    }
    if (item.disabled) {
      classes.push('breadcrumb-item-disabled');
    }
    return classes.join(' ');
  }

  /**
   * Get span CSS classes
   */
  getSpanClasses(item: BreadcrumbItem, last: boolean): string {
    const classes: string[] = [];
    if (last) {
      classes.push('breadcrumb-item-active');
    }
    if (item.disabled) {
      classes.push('breadcrumb-item-disabled');
    }
    return classes.join(' ');
  }

  /**
   * TrackBy function for breadcrumb items
   */
  trackByItem(index: number, item: BreadcrumbItem): string {
    return item.label || index.toString();
  }
}

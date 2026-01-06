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
        <li
          *ngFor="let item of items; let last = last; let i = index; trackBy: trackByItem"
          [class]="getItemClasses(item, last)"
          role="listitem"
          [attr.aria-current]="last ? 'page' : null">
          <a
            *ngIf="!last && item.route && !item.disabled"
            [routerLink]="item.route"
            [class]="linkClass"
            [attr.aria-label]="item.label">
            <mat-icon *ngIf="item.icon" [class]="iconClass" [attr.aria-hidden]="true">{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
          <span
            *ngIf="last || !item.route || item.disabled"
            [class]="getSpanClasses(item, last)"
            [attr.aria-label]="item.label">
            <mat-icon *ngIf="item.icon" [class]="iconClass" [attr.aria-hidden]="true">{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </span>
          <mat-icon
            *ngIf="!last && separator === 'icon'"
            [class]="separatorClass"
            [attr.aria-hidden]="true"
            [attr.aria-label]="'Separator'">
            {{ separatorIcon }}
          </mat-icon>
          <span
            *ngIf="!last && separator === 'text'"
            [class]="separatorClass"
            [attr.aria-hidden]="true">
            {{ separatorText }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    nav {
      display: flex;
      align-items: center;
    }

    .breadcrumb-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: var(--spacing-sm); /* 8px */
    }

    li {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm); /* 8px */
    }

    a, span {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs); /* 4px */
      text-decoration: none;
      color: inherit;
      transition: color var(--transition-fast); /* 150ms */
    }

    a {
      color: var(--color-gray-500);
    }

    a:hover {
      color: var(--color-primary-500);
    }

    .breadcrumb-item-active {
      color: var(--color-gray-900);
      font-weight: var(--font-weight-medium); /* 500 */
    }

    .breadcrumb-item-disabled {
      color: var(--color-gray-400);
      cursor: not-allowed;
    }

    /* Separator - Using Design Tokens */
    .breadcrumb-separator {
      color: var(--color-gray-400);
      user-select: none;
    }

    mat-icon.breadcrumb-separator {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    /* Icons */
    mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    /* Variants - Using Design Tokens */
    .breadcrumb-sm {
      font-size: var(--font-size-sm); /* 14px */
    }

    .breadcrumb-md {
      font-size: var(--font-size-base); /* 16px */
    }

    .breadcrumb-lg {
      font-size: var(--font-size-lg); /* 18px */
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

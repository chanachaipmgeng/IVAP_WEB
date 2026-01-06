/**
 * Sidebar Component
 * 
 * Navigation sidebar component with menu items, responsive behavior, and accessibility features.
 * Supports nested menu items and auto-closes on mobile when menu item is clicked.
 * 
 * @example
 * ```html
 * <app-sidebar
 *   [menuItems]="navigationItems"
 *   [isOpen]="sidebarOpen"
 *   (close)="onSidebarClose()">
 * </app-sidebar>
 * ```
 */

import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';

export interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  permission?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  /**
   * Menu items to display
   * @default []
   */
  @Input() menuItems: MenuItem[] = [];
  
  /**
   * Whether sidebar is open
   * @default false
   */
  @Input() isOpen: boolean = false;
  
  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';
  
  /**
   * ARIA label for sidebar navigation
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when sidebar should close
   */
  @Output() close = new EventEmitter<void>();

  private isMobileView = false;

  ngOnInit(): void {
    this.checkMobileView();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    if (typeof window !== 'undefined') {
      this.isMobileView = window.innerWidth < 1024;
      // Auto-close sidebar when switching from mobile to desktop
      if (!this.isMobileView && this.isOpen) {
        this.close.emit();
      }
    }
  }

  get shouldShowSidebar(): boolean {
    // On desktop (>= 1024px), always show sidebar
    // On mobile, show only when isOpen is true
    if (!this.isMobileView) {
      return true; // Desktop: always show
    }
    return this.isOpen; // Mobile: show only when open
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  constructor(
    public i18n: I18nService,
    public auth: AuthService
  ) {}

  /**
   * Get visible menu items (filtered by permissions if needed)
   */
  get visibleMenuItems(): MenuItem[] {
    // return this.menuItems.filter(item => {
    //   if (!item.permission) return true;
    //   return this.auth.hasPermission(item.permission);
    // });
    return this.menuItems;
  }

  /**
   * Get visible children for a menu item
   */
  getVisibleChildren(item: MenuItem): MenuItem[] {
    // if (!item.children) return [];
    // return item.children.filter(child => {
    //   if (!child.permission) return true;
    //   return this.auth.hasPermission(child.permission);
    // });
    return item.children || [];
  }

  /**
   * Toggle menu item expansion
   */
  toggleExpand(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  /**
   * Handle menu item click (closes sidebar on mobile)
   */
  onMenuItemClick(): void {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 1024) { // lg breakpoint
      this.close.emit();
    }
  }

  /**
   * TrackBy function for menu items
   */
  trackByMenuItem(index: number, item: MenuItem): string {
    return item.label + (item.route || '');
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}


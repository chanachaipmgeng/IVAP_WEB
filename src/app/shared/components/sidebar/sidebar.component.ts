/**
 * Sidebar Component
 *
 * Modern 2-layer navigation sidebar.
 * Layer 1: Main category icons (Always visible on desktop)
 * Layer 2: Submenu panel (Expandable)
 */

import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

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
  @Input() menuItems: MenuItem[] = [];
  @Input() isOpen: boolean = false;
  @Input() customClass: string = '';
  @Input() ariaLabel: string = '';
  @Output() close = new EventEmitter<void>();

  // State for 2-layer navigation
  activeMainGroup: MenuItem | null = null;
  isSubmenuOpen: boolean = true; // Default open on desktop if space permits
  
  private routerSubscription: Subscription | undefined;
  isMobileView = false;

  constructor(
    public i18n: I18nService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkMobileView();
    
    // Auto-select group based on current route
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.findActiveGroup();
    });

    // Initial check
    this.findActiveGroup();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    if (typeof window !== 'undefined') {
      const wasMobile = this.isMobileView;
      this.isMobileView = window.innerWidth < 1024;
      
      // Auto logic for sidebar state when switching views
      if (this.isMobileView !== wasMobile) {
        if (!this.isMobileView) {
          this.isSubmenuOpen = true; // Open submenu by default on desktop
        } else {
           this.isSubmenuOpen = false;
        }
      }
    }
  }

  /**
   * Find which main group contains the active route
   */
  private findActiveGroup(): void {
    const currentUrl = this.router.url;
    
    // Find group that has a child matching the current URL
    const foundGroup = this.menuItems.find(group => {
      if (group.route && currentUrl.includes(group.route)) return true;
      if (group.children) {
        return group.children.some(child => child.route && currentUrl.includes(child.route));
      }
      return false;
    });

    if (foundGroup) {
      this.activeMainGroup = foundGroup;
    } else if (!this.activeMainGroup && this.menuItems.length > 0) {
      // Default to first item if nothing selected yet
      this.activeMainGroup = this.menuItems[0];
    }
  }

  get visibleMenuItems(): MenuItem[] {
    // In a real app, filter by permissions here
    return this.menuItems;
  }

  /**
   * Handle clicking on Layer 1 (Main Group)
   */
  onMainGroupClick(item: MenuItem): void {
    this.activeMainGroup = item;
    
    // If item has no children, it's a direct link, navigate and close mobile sidebar if needed
    if (!item.children || item.children.length === 0) {
      if (item.route) {
        this.router.navigate([item.route]);
      }
      if (this.isMobileView) {
        this.close.emit();
      }
    } else {
      // It's a group, open the submenu panel
      this.isSubmenuOpen = true;
    }
  }

  /**
   * Handle clicking a submenu item
   */
  onSubLinkClick(): void {
    if (this.isMobileView) {
      this.close.emit();
    }
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

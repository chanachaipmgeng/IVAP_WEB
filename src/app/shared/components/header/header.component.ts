/**
 * Header Component
 * 
 * Application header component with navigation, user menu, theme toggle, and language switcher.
 * Provides responsive design and accessibility features.
 * 
 * @example
 * ```html
 * <app-header
 *   [sidebarOpen]="isSidebarOpen"
 *   (toggleSidebar)="onToggleSidebar()">
 * </app-header>
 * ```
 */

import { Component, computed, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  /**
   * Whether sidebar is open
   * @default false
   */
  @Input() sidebarOpen: boolean = false;
  
  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';
  
  /**
   * ARIA label for header navigation
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when sidebar toggle is clicked
   */
  @Output() toggleSidebar = new EventEmitter<void>();

  /**
   * Header title
   * @default 'Intelligent Video Analytics Platform'
   */
  title: string = 'Intelligent Video Analytics Platform';
  
  /**
   * Whether user menu is visible
   */
  showUserMenu = signal(false);
  
  /**
   * Dropdown top position
   */
  dropdownTop = signal(0);
  
  /**
   * Dropdown right position
   */
  dropdownRight = signal(0);

  @ViewChild('userMenuButton', { static: false }) userMenuButton?: ElementRef;
  @ViewChild('userMenuDropdown', { static: false }) userMenuDropdown?: ElementRef;

  /**
   * Current language (computed signal)
   */
  currentLang = computed(() => this.i18n.currentLanguage());
  
  /**
   * Current user (computed signal)
   */
  currentUser = computed(() => this.auth.currentUser());

  private clickListener?: (event: MouseEvent) => void;

  constructor(
    public themeService: ThemeService,
    public i18n: I18nService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  private setupClickOutsideListener(): void {
    this.clickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const userMenuButton = this.userMenuButton?.nativeElement;
      const userMenuDropdown = this.userMenuDropdown?.nativeElement;

      if (
        this.showUserMenu() &&
        userMenuButton &&
        userMenuDropdown &&
        !userMenuButton.contains(target) &&
        !userMenuDropdown.contains(target)
      ) {
        this.closeUserMenu();
      }
    };

    document.addEventListener('click', this.clickListener);
  }

  /**
   * Toggle theme (light/dark)
   */
  toggleTheme(): void {
    this.themeService.toggleMode();
  }

  /**
   * Toggle language
   */
  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  /**
   * Get theme icon based on current theme
   */
  getThemeIcon(): string {
    const theme = this.themeService.mode();
    return theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻';
  }

  /**
   * Toggle user menu visibility
   */
  toggleUserMenu(): void {
    const isOpening = !this.showUserMenu();
    this.showUserMenu.set(isOpening);
    
    if (isOpening && this.userMenuButton?.nativeElement) {
      // Calculate position when opening
      setTimeout(() => {
        const rect = this.userMenuButton!.nativeElement.getBoundingClientRect();
        this.dropdownTop.set(rect.bottom + 8); // 8px = mt-2 equivalent
        this.dropdownRight.set(window.innerWidth - rect.right);
      }, 0);
    }
  }

  /**
   * Close user menu
   */
  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  /**
   * Navigate to user profile
   */
  navigateToProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/portal/profile']);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.closeUserMenu();
    this.auth.logout();
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'User';
    
    if (user.fullName) return user.fullName;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || 'User';
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }

}


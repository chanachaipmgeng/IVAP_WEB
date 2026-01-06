/**
 * Offcanvas Component
 * 
 * A slide-out panel component that can appear from any side of the screen.
 * Supports multiple positions, backdrop, keyboard navigation, and focus management.
 * 
 * @example
 * ```html
 * <app-offcanvas
 *   [isOpen]="showPanel"
 *   title="Settings"
 *   [config]="{ position: 'end', size: 'md', backdrop: true }"
 *   [loading]="isLoading"
 *   (opened)="onOffcanvasOpened()"
 *   (closed)="onOffcanvasClosed()">
 *   <div>Offcanvas content</div>
 * </app-offcanvas>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OffcanvasConfig {
  position: 'start' | 'end' | 'top' | 'bottom';
  backdrop: boolean;
  backdropClose: boolean;
  keyboard: boolean;
  scroll: boolean;
  animation: boolean;
  animationDuration: number;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  zIndex: number;
  bodyScroll: boolean;
  focusTrap: boolean;
  autoFocus: boolean;
  restoreFocus: boolean;
}

@Component({
  selector: 'app-offcanvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss']
})
export class OffcanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('offcanvas', { static: false }) offcanvas!: ElementRef;
  @ViewChild('backdrop', { static: false }) backdrop!: ElementRef;

  /**
   * Whether offcanvas is open
   * @default false
   */
  @Input() isOpen: boolean = false;
  
  /**
   * Offcanvas title
   * @default ''
   */
  @Input() title: string = '';
  
  /**
   * Offcanvas configuration
   * @default {}
   */
  @Input() config: Partial<OffcanvasConfig> = {};
  
  /**
   * Whether offcanvas is in loading state
   * @default false
   */
  @Input() loading: boolean = false;
  
  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';
  
  /**
   * ARIA label for offcanvas
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when offcanvas is opened
   */
  @Output() opened = new EventEmitter<void>();
  
  /**
   * Emitted when offcanvas is closed
   */
  @Output() closed = new EventEmitter<void>();
  
  /**
   * Emitted when backdrop is clicked
   */
  @Output() backdropClick = new EventEmitter<void>();

  // Default configuration
  defaultConfig: OffcanvasConfig = {
    position: 'end',
    backdrop: true,
    backdropClose: true,
    keyboard: true,
    scroll: true,
    animation: true,
    animationDuration: 300,
    size: 'md',
    zIndex: 1050,
    bodyScroll: false,
    focusTrap: true,
    autoFocus: true,
    restoreFocus: true
  };

  // Component state
  private isAnimating: boolean = false;
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  constructor() {}

  ngOnInit(): void {
    this.updateBodyScroll();
  }

  ngAfterViewInit(): void {
    if (this.isOpen) {
      this.openOffcanvas();
    }
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
    this.restoreFocus();
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): OffcanvasConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Open offcanvas
   */
  openOffcanvas(): void {
    if (this.isOpen || this.isAnimating) return;

    this.isOpen = true;
    this.isAnimating = true;
    this.updateBodyScroll();
    this.storeActiveElement();

    if (this.mergedConfig.animation) {
      setTimeout(() => {
        this.offcanvas.nativeElement.classList.add('show');
        this.backdrop.nativeElement.classList.add('show');
      }, 10);
    } else {
      this.offcanvas.nativeElement.classList.add('show');
      this.backdrop.nativeElement.classList.add('show');
    }

    setTimeout(() => {
      this.isAnimating = false;
      this.opened.emit();
      this.setupFocusTrap();
    }, this.mergedConfig.animationDuration);
  }

  /**
   * Close offcanvas
   */
  closeOffcanvas(): void {
    if (!this.isOpen || this.isAnimating) return;

    this.isAnimating = true;
    this.offcanvas.nativeElement.classList.remove('show');
    this.backdrop.nativeElement.classList.remove('show');

    setTimeout(() => {
      this.isOpen = false;
      this.isAnimating = false;
      this.restoreBodyScroll();
      this.restoreFocus();
      this.closed.emit();
    }, this.mergedConfig.animationDuration);
  }

  /**
   * Toggle offcanvas
   */
  toggleOffcanvas(): void {
    if (this.isOpen) {
      this.closeOffcanvas();
    } else {
      this.openOffcanvas();
    }
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    if (this.mergedConfig.backdropClose) {
      this.closeOffcanvas();
      this.backdropClick.emit();
    }
  }

  /**
   * Handle keyboard events
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen || !this.mergedConfig.keyboard) return;

    if (event.key === 'Escape') {
      this.closeOffcanvas();
    }

    if (this.mergedConfig.focusTrap && event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  /**
   * Handle tab key for focus trap
   */
  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  }

  /**
   * Setup focus trap
   */
  private setupFocusTrap(): void {
    if (!this.mergedConfig.focusTrap) return;

    this.focusableElements = this.getFocusableElements();
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;

    if (this.mergedConfig.autoFocus && this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }

  /**
   * Get focusable elements
   */
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    const focusableElements: HTMLElement[] = [];
    const offcanvasElement = this.offcanvas.nativeElement;

    focusableSelectors.forEach(selector => {
      const elements = offcanvasElement.querySelectorAll(selector);
      elements.forEach((element: HTMLElement) => {
        if (this.isElementVisible(element)) {
          focusableElements.push(element);
        }
      });
    });

    return focusableElements;
  }

  /**
   * Check if element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Store active element before opening
   */
  private storeActiveElement(): void {
    if (this.mergedConfig.restoreFocus) {
      this.previousActiveElement = document.activeElement as HTMLElement;
    }
  }

  /**
   * Restore focus after closing
   */
  private restoreFocus(): void {
    if (this.mergedConfig.restoreFocus && this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  /**
   * Update body scroll
   */
  private updateBodyScroll(): void {
    if (this.mergedConfig.bodyScroll) {
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }
  }

  /**
   * Restore body scroll
   */
  private restoreBodyScroll(): void {
    if (this.mergedConfig.bodyScroll) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Get offcanvas classes
   */
  getOffcanvasClasses(): string[] {
    const classes = ['offcanvas'];
    const config = this.mergedConfig;

    // Position classes
    classes.push(`offcanvas-${config.position}`);

    // Size classes
    if (config.size !== 'full') {
      classes.push(`offcanvas-${config.size}`);
    }

    // State classes
    if (this.isOpen) {
      classes.push('show');
    }

    if (this.isAnimating) {
      classes.push('animating');
    }

    return classes;
  }

  /**
   * Get offcanvas styles
   */
  getOffcanvasStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    if (this.mergedConfig.animation) {
      styles['transition-duration'] = `${this.mergedConfig.animationDuration}ms`;
    }

    styles['z-index'] = this.mergedConfig.zIndex.toString();

    return styles;
  }

  /**
   * Get backdrop classes
   */
  getBackdropClasses(): string[] {
    const classes = ['offcanvas-backdrop'];

    if (this.isOpen) {
      classes.push('show');
    }

    if (this.isAnimating) {
      classes.push('animating');
    }

    return classes;
  }

  /**
   * Get backdrop styles
   */
  getBackdropStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    if (this.mergedConfig.animation) {
      styles['transition-duration'] = `${this.mergedConfig.animationDuration}ms`;
    }

    styles['z-index'] = (this.mergedConfig.zIndex - 1).toString();

    return styles;
  }

  /**
   * Get header classes
   */
  getHeaderClasses(): string[] {
    const classes = ['offcanvas-header'];

    if (this.mergedConfig.position === 'top' || this.mergedConfig.position === 'bottom') {
      classes.push('offcanvas-header-horizontal');
    } else {
      classes.push('offcanvas-header-vertical');
    }

    return classes;
  }

  /**
   * Get body classes
   */
  getBodyClasses(): string[] {
    const classes = ['offcanvas-body'];

    if (this.mergedConfig.position === 'top' || this.mergedConfig.position === 'bottom') {
      classes.push('offcanvas-body-horizontal');
    } else {
      classes.push('offcanvas-body-vertical');
    }

    return classes;
  }

  /**
   * Get close button classes
   */
  getCloseButtonClasses(): string[] {
    const classes = ['btn-close'];

    if (this.mergedConfig.position === 'top' || this.mergedConfig.position === 'bottom') {
      classes.push('btn-close-horizontal');
    } else {
      classes.push('btn-close-vertical');
    }

    return classes;
  }
}

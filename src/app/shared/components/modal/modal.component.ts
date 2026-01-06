/**
 * Modal Component
 *
 * A modal/dialog component with glass morphism styling.
 * Supports multiple sizes, animations, keyboard navigation, and focus management.
 *
 * @example
 * ```html
 * <app-modal
 *   [isOpen]="showModal"
 *   title="Modal Title"
 *   [config]="{ size: 'lg', centered: true }"
 *   [loading]="isLoading"
 *   (opened)="onModalOpened()"
 *   (closed)="onModalClosed()">
 *   <p>Modal content goes here</p>
 * </app-modal>
 * ```
 */
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../glass-card/glass-card.component';

export interface ModalConfig {
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  backdrop: boolean | 'static';
  keyboard: boolean;
  focus: boolean;
  animation: boolean;
  scrollable: boolean;
  centered: boolean;
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  zIndex: number;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  /**
   * Whether the modal is open
   * @default false
   */
  @Input() isOpen: boolean = false;

  /**
   * Modal title
   * @default ''
   */
  @Input() title: string = '';

  /**
   * Configuration object for modal behavior
   * @default {}
   */
  @Input() config: Partial<ModalConfig> = {};

  /**
   * Whether the modal can be closed
   * @default true
   */
  @Input() closable: boolean = true;

  /**
   * Whether the modal is in loading state
   * @default false
   */
  @Input() loading: boolean = false;

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for modal
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when modal is opened
   */
  @Output() opened = new EventEmitter<void>();

  /**
   * Emitted when modal is closed
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Emitted when backdrop is clicked
   */
  @Output() backdropClick = new EventEmitter<void>();

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;
  @ViewChild('glassCard', { static: false }) glassCard!: ElementRef;

  // Default configuration - Modern, centered, beautiful modal
  defaultConfig: ModalConfig = {
    size: 'lg', // Default to large for better form layouts
    backdrop: true,
    keyboard: true,
    focus: true,
    animation: true,
    scrollable: true, // Enable scrolling for long content
    centered: true, // Always centered by default
    closeOnEscape: true,
    closeOnBackdrop: true,
    zIndex: 1050
  };

  // Component state
  isAnimating: boolean = false;
  previousActiveElement: HTMLElement | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.openModal();
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): ModalConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Open modal
   */
  openModal(): void {
    if (this.isOpen || this.isAnimating) {
      return;
    }

    this.isOpen = true;
    this.isAnimating = true;

    // Store previous active element for focus restoration
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Prevent body scroll
    this.renderer.addClass(document.body, 'modal-open');

    // Set z-index
    this.renderer.setStyle(document.body, 'z-index', this.mergedConfig.zIndex.toString());

    // Focus management
    if (this.mergedConfig.focus) {
      setTimeout(() => {
        this.focusModal();
      }, 100);
    }

    // Animation complete
    setTimeout(() => {
      this.isAnimating = false;
      this.opened.emit();
    }, 300);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    if (!this.isOpen || this.isAnimating) {
      return;
    }

    this.isAnimating = true;

    // Restore body scroll
    this.renderer.removeClass(document.body, 'modal-open');
    this.renderer.removeStyle(document.body, 'z-index');

    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }

    // Animation complete
    setTimeout(() => {
      this.isOpen = false;
      this.isAnimating = false;
      this.closed.emit();
    }, 300);
  }

  /**
   * Toggle modal
   */
  toggleModal(): void {
    if (this.isOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && this.mergedConfig.closeOnBackdrop) {
      this.backdropClick.emit();
      this.closeModal();
    }
  }

  /**
   * Handle escape key
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen && this.mergedConfig.closeOnEscape && this.closable) {
      this.closeModal();
    }
  }

  /**
   * Focus modal content
   */
  private focusModal(): void {
    const contentElement = this.glassCard?.nativeElement || this.modalContent?.nativeElement;
    if (contentElement) {
      const focusableElements = contentElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        contentElement.focus();
      }
    }
  }

  /**
   * Get modal classes
   */
  getModalClasses(): string[] {
    const classes = ['modal'];
    const config = this.mergedConfig;

    // Size classes
    classes.push(`modal-${config.size}`);

    // Animation classes
    if (config.animation) {
      classes.push('modal-animated');
    }

    // Centered classes
    if (config.centered) {
      classes.push('modal-centered');
    }

    // Scrollable classes
    if (config.scrollable) {
      classes.push('modal-scrollable');
    }

    return classes;
  }

  /**
   * Get modal dialog classes
   */
  getModalDialogClasses(): string[] {
    const classes = ['modal-dialog'];
    const config = this.mergedConfig;

    // Size classes
    classes.push(`modal-dialog-${config.size}`);

    // Centered classes
    if (config.centered) {
      classes.push('modal-dialog-centered');
    }

    // Scrollable classes
    if (config.scrollable) {
      classes.push('modal-dialog-scrollable');
    }

    return classes;
  }

  /**
   * Get modal styles
   */
  getModalStyles(): { [key: string]: string } {
    return {
      zIndex: this.mergedConfig.zIndex.toString()
    };
  }

  /**
   * Get modal content classes
   */
  getModalContentClasses(): string[] {
    const classes = ['modal-content'];

    if (this.isAnimating) {
      classes.push('modal-content-animating');
    }

    return classes;
  }

  /**
   * Check if backdrop should be shown
   */
  shouldShowBackdrop(): boolean {
    return this.mergedConfig.backdrop === true;
  }

  /**
   * Check if backdrop is static
   */
  isBackdropStatic(): boolean {
    return this.mergedConfig.backdrop === 'static';
  }
}

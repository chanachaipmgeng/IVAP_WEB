/**
 * Tooltip Component
 *
 * A customizable tooltip component that displays additional information on hover or click.
 * Supports multiple positions, themes, sizes, and interactive mode.
 *
 * @example
 * ```html
 * <app-tooltip
 *   content="This is a tooltip"
 *   [config]="{ position: 'top', theme: 'dark', showArrow: true }"
 *   [disabled]="isLoading">
 *   <button>Hover me</button>
 * </app-tooltip>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TooltipConfig {
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  theme: 'light' | 'dark' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size: 'sm' | 'md' | 'lg';
  showArrow: boolean;
  showDelay: number;
  hideDelay: number;
  maxWidth: string;
  zIndex: number;
  animation: boolean;
  interactive: boolean;
}

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy {
  /**
   * Tooltip content text
   * @default ''
   */
  @Input() content: string = '';

  /**
   * Tooltip configuration
   * @default {}
   */
  @Input() config: Partial<TooltipConfig> = {};

  /**
   * Whether tooltip is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Additional CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for accessibility
   */
  @Input() ariaLabel?: string;

  @ViewChild('tooltipTrigger', { static: true }) triggerElement!: ElementRef;
  @ViewChild('tooltipContent', { static: false }) contentElement!: ElementRef;

  // Default configuration
  defaultConfig: TooltipConfig = {
    position: 'top',
    theme: 'dark',
    size: 'md',
    showArrow: true,
    showDelay: 500,
    hideDelay: 200,
    maxWidth: '300px',
    zIndex: 1000,
    animation: true,
    interactive: false
  };

  // Component state
  isVisible: boolean = false;
  actualPosition: string = 'top';
  showTimeout: ReturnType<typeof setTimeout> | null = null;
  hideTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Unique ID for tooltip (auto-generated)
   */
  tooltipId: string = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.actualPosition = this.mergedConfig.position;
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): TooltipConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Show tooltip
   */
  show(): void {
    if (this.disabled || !this.content || this.isVisible) {
      return;
    }

    this.clearTimeouts();
    this.showTimeout = setTimeout(() => {
      this.isVisible = true;
      this.calculatePosition();
    }, this.mergedConfig.showDelay);
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => {
      this.isVisible = false;
    }, this.mergedConfig.hideDelay);
  }

  /**
   * Toggle tooltip visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Clear all timeouts
   */
  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Calculate tooltip position
   */
  private calculatePosition(): void {
    if (!this.triggerElement || !this.contentElement) {
      return;
    }

    const triggerRect = this.triggerElement.nativeElement.getBoundingClientRect();
    const contentRect = this.contentElement.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let position = this.mergedConfig.position;

    // Auto positioning
    if (position === 'auto') {
      position = this.calculateAutoPosition(triggerRect, contentRect, viewportWidth, viewportHeight);
    }

    this.actualPosition = position;
    this.positionTooltip(triggerRect, contentRect, position);
  }

  /**
   * Calculate auto position based on available space
   */
  private calculateAutoPosition(
    triggerRect: DOMRect,
    contentRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number
  ): 'top' | 'bottom' | 'left' | 'right' {
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    const contentHeight = contentRect.height;
    const contentWidth = contentRect.width;

    // Check if there's enough space for each position
    if (spaceTop >= contentHeight + 10) {
      return 'top';
    } else if (spaceBottom >= contentHeight + 10) {
      return 'bottom';
    } else if (spaceLeft >= contentWidth + 10) {
      return 'left';
    } else if (spaceRight >= contentWidth + 10) {
      return 'right';
    }

    // Default to top if no space available
    return 'top';
  }

  /**
   * Position tooltip based on calculated position
   */
  private positionTooltip(triggerRect: DOMRect, contentRect: DOMRect, position: 'top' | 'bottom' | 'left' | 'right'): void {
    if (!this.contentElement) {
      return;
    }

    const element = this.contentElement.nativeElement;
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    // Reset positioning
    this.renderer.setStyle(element, 'top', 'auto');
    this.renderer.setStyle(element, 'bottom', 'auto');
    this.renderer.setStyle(element, 'left', 'auto');
    this.renderer.setStyle(element, 'right', 'auto');
    this.renderer.setStyle(element, 'transform', 'none');

    switch (position) {
      case 'top':
        this.renderer.setStyle(element, 'bottom', `${window.innerHeight - triggerRect.top + 10}px`);
        this.renderer.setStyle(element, 'left', `${triggerCenterX - contentRect.width / 2}px`);
        break;

      case 'bottom':
        this.renderer.setStyle(element, 'top', `${triggerRect.bottom + 10}px`);
        this.renderer.setStyle(element, 'left', `${triggerCenterX - contentRect.width / 2}px`);
        break;

      case 'left':
        this.renderer.setStyle(element, 'top', `${triggerCenterY - contentRect.height / 2}px`);
        this.renderer.setStyle(element, 'right', `${window.innerWidth - triggerRect.left + 10}px`);
        break;

      case 'right':
        this.renderer.setStyle(element, 'top', `${triggerCenterY - contentRect.height / 2}px`);
        this.renderer.setStyle(element, 'left', `${triggerRect.right + 10}px`);
        break;
    }
  }

  /**
   * Get tooltip classes
   */
  getTooltipClasses(): string[] {
    const classes = ['tooltip-content'];
    const config = this.mergedConfig;

    // Position classes
    classes.push(`tooltip-${this.actualPosition}`);

    // Theme classes
    classes.push(`tooltip-${config.theme}`);

    // Size classes
    classes.push(`tooltip-${config.size}`);

    // Animation classes
    if (config.animation) {
      classes.push('tooltip-animated');
    }

    // Interactive classes
    if (config.interactive) {
      classes.push('tooltip-interactive');
    }

    return classes;
  }

  /**
   * Get tooltip styles
   */
  getTooltipStyles(): { [key: string]: string } {
    const config = this.mergedConfig;
    return {
      maxWidth: config.maxWidth,
      zIndex: config.zIndex.toString()
    };
  }

  /**
   * Handle mouse enter
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.mergedConfig.interactive) {
      this.show();
    }
  }

  /**
   * Handle mouse leave
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.mergedConfig.interactive) {
      this.hide();
    }
  }

  /**
   * Handle click
   */
  @HostListener('click')
  onClick(): void {
    if (this.mergedConfig.interactive) {
      this.toggle();
    }
  }

  /**
   * Handle escape key
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isVisible) {
      this.hide();
    }
  }
}

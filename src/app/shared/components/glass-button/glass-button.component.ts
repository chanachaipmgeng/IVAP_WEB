/**
 * Glass Button Component
 *
 * A button component with glass morphism styling.
 * Supports multiple variants, sizes, and states (loading, disabled).
 *
 * @example
 * ```html
 * <app-glass-button
 *   variant="primary"
 *   size="md"
 *   [loading]="isLoading"
 *   (clicked)="onButtonClick($event)">
 *   Click Me
 * </app-glass-button>
 * ```
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-button',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./glass-button.component.scss'],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      [attr.aria-label]="ariaLabel"
      [attr.aria-busy]="loading"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="inline-block animate-spin mr-2" aria-hidden="true">⟳</span>
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class GlassButtonComponent {
  /**
   * Button type
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Visual variant
   * @default 'secondary'
   */
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'secondary';

  /**
   * Button size
   * @default 'md'
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Whether the button is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Whether the button is in loading state
   * @default false
   */
  @Input() loading: boolean = false;

  /**
   * Whether the button should take full width
   * @default false
   */
  @Input() fullWidth: boolean = false;

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for accessibility
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when button is clicked
   */
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    // Base classes using design tokens (via Tailwind)
    const baseClasses = 'inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed md:px-5 md:py-2 md:text-sm px-4 py-1.5 text-sm';

    const variantClasses = {
      'primary': 'glass-button-primary',
      'secondary': 'glass-button',
      'danger': 'glass-button-danger'
    }[this.variant];

    // Size classes using design tokens
    // Design System: Button Text = text-sm font-semibold (14px, 600)
    // Spacing tokens: sm = 0.5rem (8px), md = 1rem (16px)
    // Responsive: Mobile uses smaller padding, Desktop uses default
    const sizeClasses = {
      'sm': 'px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm',      // padding: 0.375rem 1rem (6px 16px)
      'md': 'px-4 py-1.5 text-sm md:px-5 md:py-2',        // padding: 0.5rem 1.25rem (8px 20px) - Design System default
      'lg': 'px-5 py-2 text-sm md:px-6 md:py-2.5 md:text-base'     // padding: 0.625rem 1.5rem (10px 24px)
    }[this.size];

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${this.customClass}`;
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}


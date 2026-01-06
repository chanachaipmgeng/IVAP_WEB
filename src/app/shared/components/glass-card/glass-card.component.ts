/**
 * Glass Card Component
 *
 * A card component with glass morphism styling.
 * Provides a container with customizable padding and glass effect.
 *
 * @example
 * ```html
 * <app-glass-card padding="md" customClass="my-custom-class">
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </app-glass-card>
 * ```
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="cardClasses"
      [ngClass]="customClass"
      [attr.role]="role"
      [attr.aria-label]="ariaLabel">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class GlassCardComponent {
  /**
   * Padding size
   * @default 'md'
   */
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA role for accessibility
   * @default 'region'
   */
  @Input() role: string = 'region';

  /**
   * ARIA label for accessibility
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Get card classes with padding
   */
  get cardClasses(): string {
    const base = 'glass-card';
    // Padding classes using design tokens (via Tailwind)
    // Design tokens: sm = 0.5rem (8px), md = 1rem (16px), lg = 1.5rem (24px)
    // Tailwind: p-4 = 1rem (16px), p-6 = 1.5rem (24px), p-8 = 2rem (32px)
    const paddingClass = {
      'none': '',
      'sm': 'p-4',  // 1rem = spacing.md
      'md': 'p-6',  // 1.5rem = spacing.lg
      'lg': 'p-8'   // 2rem = spacing.xl
    }[this.padding];

    return `${base} ${paddingClass}`.trim();
  }
}


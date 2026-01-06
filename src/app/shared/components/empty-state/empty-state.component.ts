/**
 * Empty State Component
 *
 * Displays an empty state message with optional icon, title, description, and action buttons.
 * Used to indicate when there is no data to display or when an action is needed.
 *
 * @example
 * ```html
 * <app-empty-state
 *   icon="📭"
 *   title="No items found"
 *   description="Try adjusting your filters"
 *   [action]="addAction">
 * </app-empty-state>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { GlassButtonComponent } from '../glass-button/glass-button.component';

/**
 * Empty state action interface
 */
export interface EmptyStateAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TranslateModule, GlassCardComponent, GlassButtonComponent],
  template: `
    <app-glass-card [customClass]="customClass || 'p-12 text-center'" [ariaLabel]="ariaLabel || title || 'Empty state'">
      <div class="flex flex-col items-center justify-center" role="status" [attr.aria-live]="ariaLive">
        <!-- Icon -->
        <div class="text-6xl mb-4" [class]="iconSizeClass" [attr.aria-hidden]="true">
          {{ icon || defaultIcon }}
        </div>

        <!-- Title -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ title || ('common.emptyState.title' | translate) }}
        </h3>

        <!-- Description -->
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {{ message || description || ('common.emptyState.description' | translate) }}
        </p>

        <!-- Action Buttons -->
        @if (actions && actions.length > 0) {
          <div class="flex flex-col sm:flex-row gap-2" role="group" [attr.aria-label]="'Actions'">
            @for (action of actions; track trackByAction($index, action)) {
              <app-glass-button
                [variant]="action.variant || 'primary'"
                [ariaLabel]="action.label"
                (clicked)="action.onClick()">
                @if (action.icon) {
                  <span class="mr-2" [attr.aria-hidden]="true">{{ action.icon }}</span>
                }
                {{ action.label }}
              </app-glass-button>
            }
          </div>
        } @else if (action) {
          <app-glass-button
            [variant]="action.variant || 'primary'"
            [ariaLabel]="action.label"
            (clicked)="action.onClick()">
            @if (action.icon) {
              <span class="mr-2" [attr.aria-hidden]="true">{{ action.icon }}</span>
            }
            {{ action.label }}
          </app-glass-button>
        }
      </div>
    </app-glass-card>
  `,
  styles: []
})
export class EmptyStateComponent {
  /**
   * Icon to display (emoji or icon string)
   */
  @Input() icon?: string;

  /**
   * Title text
   */
  @Input() title?: string;

  /**
   * Description text
   */
  @Input() description?: string;

  /**
   * Message text (alias for description)
   */
  @Input() message?: string;

  /**
   * Single action button
   */
  @Input() action?: EmptyStateAction;

  /**
   * Multiple action buttons
   */
  @Input() actions?: EmptyStateAction[];

  /**
   * Icon size
   */
  @Input() iconSize: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA live region setting
   */
  @Input() ariaLive: 'polite' | 'assertive' | 'off' = 'polite';

  /**
   * Default icon
   */
  defaultIcon = '📭';

  /**
   * Get icon size CSS class
   */
  get iconSizeClass(): string {
    const sizes: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'text-4xl',
      md: 'text-6xl',
      lg: 'text-8xl'
    };
    return sizes[this.iconSize] || sizes.md;
  }

  /**
   * TrackBy function for actions
   */
  trackByAction(index: number, action: EmptyStateAction): string {
    return action.label || index.toString();
  }
}

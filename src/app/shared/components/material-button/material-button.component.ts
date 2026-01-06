/**
 * Material Button Component
 *
 * A Material Design button component wrapper using Angular Material.
 * Provides a Material-styled button with icon and text support.
 *
 * @example
 * ```html
 * <app-material-button
 *   [text]="'Click me'"
 *   [icon]="'add'"
 *   [color]="'primary'"
 *   [disabled]="false"
 *   [customClass]="'my-button'"
 *   [ariaLabel]="'Add new item'"
 *   (clicked)="onButtonClick()">
 * </app-material-button>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-material-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-raised-button
      [color]="color"
      [disabled]="disabled"
      [class]="customClass"
      [attr.aria-label]="ariaLabel || text || 'Button'"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [attr.aria-busy]="loading ? 'true' : null"
      [attr.title]="tooltip || text || ''"
      (click)="onClick()"
>
      <mat-icon *ngIf="icon && !loading" [class]="iconClass" [attr.aria-hidden]="'true'">{{ icon }}</mat-icon>
      <span *ngIf="loading" class="spinner" [attr.aria-hidden]="'true'"></span>
      <span *ngIf="text" [class]="textClass">{{ text }}</span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .gemini-glow {
      animation: material-glow 3s ease-in-out infinite;
    }

    .gemini-shimmer {
      position: relative;
      overflow: hidden;
    }

    .gemini-shimmer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      animation: ai-signal-flow 3s ease-in-out infinite;
    }
  `]
})
export class MaterialButtonComponent {
  /**
   * Button text
   */
  @Input() text: string = '';

  /**
   * Icon name (Material Icons)
   */
  @Input() icon: string = '';

  /**
   * Button color variant
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Icon CSS classes
   */
  @Input() iconClass: string = '';

  /**
   * Text CSS classes
   */
  @Input() textClass: string = '';

  /**
   * Ripple effect enabled
   */
  @Input() ripple: boolean = true;

  /**
   * Ripple color
   */
  @Input() rippleColor: string = 'rgba(59, 130, 246, 0.3)';

  /**
   * Tooltip text
   */
  @Input() tooltip: string = '';

  /**
   * ARIA label for the button
   */
  @Input() ariaLabel?: string;

  /**
   * Button click event
   */
  @Output() clicked = new EventEmitter<void>();

  /**
   * Handle button click
   */
  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}


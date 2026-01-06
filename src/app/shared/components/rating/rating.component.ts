/**
 * Rating Component
 *
 * A flexible rating component with support for stars, hearts, smileys, and thumbs.
 * Implements ControlValueAccessor for form integration and supports editable/read-only modes.
 *
 * @example
 * ```html
 * <app-rating
 *   [value]="rating"
 *   [config]="ratingConfig"
 *   [editable]="true"
 *   (ratingChange)="onRatingChange($event)">
 * </app-rating>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Rating configuration interface
 */
export interface RatingConfig {
  max: number;
  readOnly: boolean;
  showText: boolean;
  showCancel: boolean;
  cancelText: string;
  clearable: boolean;
  theme: 'default' | 'stars' | 'hearts' | 'smiley' | 'thumbs';
  size: 'small' | 'medium' | 'large';
  color: string;
  emptyColor: string;
  textPosition: 'left' | 'right' | 'top' | 'bottom';
  animation: boolean;
  animationDuration: number;
}

/**
 * Rating statistics interface
 */
export interface RatingStats {
  average: number;
  total: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

/**
 * Star data interface
 */
interface StarData {
  index: number;
  filled: boolean;
  half: boolean;
  hover: boolean;
}

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rating-container" [class]="customClass">
      <label *ngIf="label" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-error-500 ml-1">*</span>
      </label>

      <div class="rating-wrapper" [class]="getWrapperClass()" role="group" [attr.aria-label]="ariaLabel || label || 'Rating'">
        <!-- Rating Display -->
        <div class="rating-display" *ngIf="!editable" role="img" [attr.aria-label]="getRatingAriaLabel()">
          <div class="flex items-center space-x-2">
            <div class="flex items-center" [attr.aria-hidden]="true">
              <span *ngFor="let star of getStars(); trackBy: trackByStar"
                    class="rating-star"
                    [class.filled]="star.filled"
                    [class.half]="star.half"
                    [class.empty]="!star.filled && !star.half">
                {{ getStarIcon() }}
              </span>
            </div>
            <span *ngIf="showValue" class="rating-value text-sm text-gray-600 dark:text-gray-400" [attr.aria-label]="'Rating: ' + value + ' out of ' + config.max">
              {{ value }}/{{ config.max }}
            </span>
            <span *ngIf="showText && getRatingText()" class="rating-text text-sm text-gray-600 dark:text-gray-400">
              {{ getRatingText() }}
            </span>
          </div>
        </div>

        <!-- Custom Rating -->
        <div class="custom-rating" *ngIf="editable" role="radiogroup" [attr.aria-label]="ariaLabel || label || 'Rating'">
          <div class="flex items-center space-x-1">
            <button
              *ngFor="let star of getStars(); trackBy: trackByStar"
              type="button"
              (click)="onStarClick(star.index)"
              (mouseenter)="onStarHover(star.index)"
              (mouseleave)="onStarLeave()"
              class="rating-star-button"
              [class.filled]="star.filled"
              [class.half]="star.half"
              [class.hover]="star.hover"
              [disabled]="disabled"
              [attr.aria-label]="'Rate ' + star.index + ' out of ' + config.max"
              [attr.aria-pressed]="star.filled ? 'true' : 'false'"
              [attr.aria-checked]="star.filled ? 'true' : 'false'"
              role="radio"
              [attr.tabindex]="disabled ? -1 : 0">
              {{ getStarIcon() }}
            </button>
            <button
              *ngIf="config.clearable"
              type="button"
              (click)="onClear()"
              class="rating-clear-button"
              [disabled]="disabled"
              [attr.aria-label]="'Clear rating'">
              {{ config.cancelText }}
            </button>
          </div>
        </div>

        <!-- Rating Text -->
        <div *ngIf="showText && getRatingText()" class="rating-text-display mt-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ getRatingText() }}
          </span>
        </div>

        <!-- Rating Statistics -->
        <div *ngIf="showStats && stats" class="rating-stats mt-3">
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Average: {{ stats.average | number:'1.1-1' }}</span>
            <span>Total: {{ stats.total }}</span>
            <span>Distribution:</span>
            <div class="flex space-x-1" role="list" [attr.aria-label]="'Rating distribution'">
              <span *ngFor="let dist of stats.distribution; trackBy: trackByDistribution"
                    class="rating-distribution"
                    [style.width.px]="dist.percentage * 50"
                    role="listitem"
                    [attr.aria-label]="'Rating ' + dist.rating + ': ' + dist.count + ' votes'">
                {{ dist.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message text-red-500 text-sm mt-1">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .rating-container {
      width: 100%;
    }

    .rating-wrapper {
      @apply flex flex-col space-y-2;
    }

    .rating-display {
      @apply flex items-center space-x-2;
    }

    .rating-star {
      @apply text-2xl transition-colors duration-200;
      color: var(--color-gray-300);
    }

    .rating-star.filled {
      color: var(--color-warning-400);
    }

    .rating-star.half {
      background: linear-gradient(90deg, var(--color-warning-400) 50%, var(--color-gray-300) 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .rating-star.hover {
      color: var(--color-warning-500);
    }

    .rating-star-button {
      @apply p-1 rounded transition-all duration-200;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-gray-300);
    }

    .rating-star-button:hover:not(:disabled) {
      color: var(--color-warning-500);
      transform: scale(1.1);
    }

    .rating-star-button.filled {
      color: var(--color-warning-400);
    }

    .rating-star-button.half {
      background: linear-gradient(90deg, var(--color-warning-400) 50%, var(--color-gray-300) 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .rating-star-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .rating-clear-button {
      @apply px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200;
      border: none;
      cursor: pointer;
    }

    .rating-clear-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .rating-value {
      @apply font-medium;
    }

    .rating-text {
      @apply font-medium;
    }

    .rating-text-display {
      @apply text-center;
    }

    .rating-stats {
      @apply border-t border-gray-200 dark:border-gray-700 pt-3;
    }

    .rating-distribution {
      @apply h-2 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center;
      min-width: 20px;
    }

    .error-message {
      @apply text-red-500 text-sm mt-1;
    }

    /* Size variations */
    .rating-wrapper.small .rating-star,
    .rating-wrapper.small .rating-star-button {
      @apply text-lg;
    }

    .rating-wrapper.large .rating-star,
    .rating-wrapper.large .rating-star-button {
      @apply text-3xl;
    }

    /* Theme variations */
    .rating-wrapper.hearts .rating-star,
    .rating-wrapper.hearts .rating-star-button {
      color: #ef4444;
    }

    .rating-wrapper.hearts .rating-star.filled,
    .rating-wrapper.hearts .rating-star-button.filled {
      color: #dc2626;
    }

    .rating-wrapper.smiley .rating-star,
    .rating-wrapper.smiley .rating-star-button {
      color: #fbbf24;
    }

    .rating-wrapper.thumbs .rating-star,
    .rating-wrapper.thumbs .rating-star-button {
      color: #10b981;
    }

    /* Animation - Using Design Tokens */
    .rating-wrapper.animated .rating-star,
    .rating-wrapper.animated .rating-star-button {
      transition: all var(--transition-normal); /* 300ms */
    }

    .rating-wrapper.animated .rating-star:hover,
    .rating-wrapper.animated .rating-star-button:hover {
      transform: scale(1.2);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent implements OnInit, ControlValueAccessor {
  /**
   * Label text
   */
  @Input() label: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Editable mode
   */
  @Input() editable: boolean = true;

  /**
   * Show value
   */
  @Input() showValue: boolean = true;

  /**
   * Show text
   */
  @Input() showText: boolean = true;

  /**
   * Show statistics
   */
  @Input() showStats: boolean = false;

  /**
   * Use bar rating
   */
  @Input() useBarRating: boolean = true;

  /**
   * Current rating value
   */
  @Input() value: number = 0;

  /**
   * Rating configuration
   */
  @Input() config: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: true,
    cancelText: 'Clear',
    clearable: true,
    theme: 'stars',
    size: 'medium',
    color: '#fbbf24',
    emptyColor: '#d1d5db',
    textPosition: 'right',
    animation: true,
    animationDuration: 300
  };

  /**
   * Rating statistics
   */
  @Input() stats: RatingStats | null = null;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Rating change event
   */
  @Output() ratingChange = new EventEmitter<number>();

  /**
   * Rating hover event
   */
  @Output() ratingHover = new EventEmitter<number>();

  /**
   * Rating leave event
   */
  @Output() ratingLeave = new EventEmitter<void>();

  /**
   * Rating select event
   */
  @Output() ratingSelect = new EventEmitter<number>();

  /**
   * Rating clear event
   */
  @Output() ratingClear = new EventEmitter<void>();

  /**
   * Hover value
   */
  hoverValue: number = 0;

  /**
   * Is hovering flag
   */
  isHovering: boolean = false;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: number) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  /**
   * Rating text mappings
   */
  private ratingTexts: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.updateRatingTexts();
  }

  /**
   * Update rating texts based on max value
   */
  private updateRatingTexts(): void {
    if (this.config.max === 5) {
      this.ratingTexts = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      };
    } else if (this.config.max === 10) {
      this.ratingTexts = {
        1: 'Terrible',
        2: 'Poor',
        3: 'Bad',
        4: 'Below Average',
        5: 'Average',
        6: 'Above Average',
        7: 'Good',
        8: 'Very Good',
        9: 'Excellent',
        10: 'Outstanding'
      };
    }
  }

  /**
   * Get stars data for rendering
   */
  getStars(): StarData[] {
    const stars: StarData[] = [];
    const currentValue = this.isHovering ? this.hoverValue : this.value;

    for (let i = 1; i <= this.config.max; i++) {
      stars.push({
        index: i,
        filled: i <= currentValue,
        half: i === Math.ceil(currentValue) && currentValue % 1 !== 0,
        hover: this.isHovering && i <= this.hoverValue
      });
    }

    return stars;
  }

  /**
   * Get star icon based on theme
   */
  getStarIcon(): string {
    switch (this.config.theme) {
      case 'hearts':
        return '❤️';
      case 'smiley':
        return '😊';
      case 'thumbs':
        return '👍';
      default:
        return '★';
    }
  }

  /**
   * Get rating text
   */
  getRatingText(): string {
    const roundedValue = Math.round(this.value);
    return this.ratingTexts[roundedValue] || '';
  }

  /**
   * Get rating ARIA label
   */
  getRatingAriaLabel(): string {
    const text = this.getRatingText();
    return text ? `${this.value} out of ${this.config.max}, ${text}` : `${this.value} out of ${this.config.max}`;
  }

  /**
   * Get wrapper CSS classes
   */
  getWrapperClass(): string {
    const classes: string[] = ['rating-wrapper'];

    if (this.config.size !== 'medium') {
      classes.push(this.config.size);
    }

    if (this.config.theme !== 'default') {
      classes.push(this.config.theme);
    }

    if (this.config.animation) {
      classes.push('animated');
    }

    return classes.join(' ');
  }

  /**
   * Handle clear rating
   */
  onClear(): void {
    this.value = 0;
    this.onChange(0);
    this.onTouched();
    this.ratingClear.emit();
  }

  /**
   * Handle star click
   */
  onStarClick(index: number): void {
    if (this.disabled) return;

    if (this.value === index) {
      this.onClear();
    } else {
      this.value = index;
      this.onChange(index);
      this.onTouched();
      this.ratingChange.emit(index);
      this.ratingSelect.emit(index);
    }
  }

  /**
   * Handle star hover
   */
  onStarHover(index: number): void {
    if (this.disabled) return;

    this.hoverValue = index;
    this.isHovering = true;
    this.ratingHover.emit(index);
  }

  /**
   * Handle star leave
   */
  onStarLeave(): void {
    this.isHovering = false;
    this.ratingLeave.emit();
  }

  /**
   * TrackBy function for stars
   */
  trackByStar(index: number, star: StarData): number {
    return star.index;
  }

  /**
   * TrackBy function for distribution
   */
  trackByDistribution(index: number, dist: { rating: number; count: number; percentage: number }): number {
    return dist.rating;
  }

  // ControlValueAccessor implementation
  /**
   * Write value from form control
   */
  writeValue(value: number): void {
    this.value = value || 0;
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

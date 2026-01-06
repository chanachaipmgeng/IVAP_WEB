/**
 * Range Slider Component
 *
 * A customizable range slider component for selecting numeric values within a range.
 * Implements ControlValueAccessor for form integration and supports min/max, step, and precision.
 *
 * @example
 * ```html
 * <app-range-slider
 *   [label]="'Volume'"
 *   [min]="0"
 *   [max]="100"
 *   [step]="1"
 *   [unit]="'%'"
 *   [value]="volume"
 *   (valueChange)="onVolumeChange($event)">
 * </app-range-slider>
 * ```
 */

import { Component, Input, OnInit, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-range-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="range-slider-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'Range slider'">
      <label *ngIf="label" [for]="sliderId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1" [attr.aria-label]="'Required'">*</span>
      </label>

      <div class="range-slider-wrapper">
        <!-- Value Display -->
        <div class="value-display" role="status" [attr.aria-live]="'polite'" [attr.aria-atomic]="true">
          <span class="current-value" [attr.aria-label]="'Current value: ' + displayValue + (unit || '')">{{ displayValue }}</span>
          <span *ngIf="unit" class="unit" [attr.aria-hidden]="true">{{ unit }}</span>
        </div>

        <!-- Range Slider -->
        <div class="slider-container">
          <input
            [id]="sliderId"
            type="range"
            [min]="min"
            [max]="max"
            [step]="step"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled"
            class="range-slider"
            [class.error]="errorMessage"
            [class.disabled]="disabled"
            [attr.aria-label]="ariaLabel || label || 'Range slider'"
            [attr.aria-valuemin]="min"
            [attr.aria-valuemax]="max"
            [attr.aria-valuenow]="value"
            [attr.aria-valuetext]="displayValue + (unit || '')"
            [attr.aria-invalid]="errorMessage ? 'true' : null"
            [attr.aria-describedby]="errorMessage ? errorId : null"
            role="slider">

          <!-- Min/Max Labels -->
          <div class="range-labels" [attr.aria-hidden]="true">
            <span class="min-label">{{ min }}{{ unit }}</span>
            <span class="max-label">{{ max }}{{ unit }}</span>
          </div>
        </div>

        <!-- Input Field (Optional) -->
        <div *ngIf="showInput" class="input-field">
          <input
            type="number"
            [min]="min"
            [max]="max"
            [step]="step"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
            [disabled]="disabled"
            class="number-input"
            [class.error]="errorMessage"
            [attr.aria-label]="'Enter value'"
            [attr.aria-invalid]="errorMessage ? 'true' : null"
            [attr.aria-describedby]="errorMessage ? errorId : null">
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'polite'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .range-slider-container {
      width: 100%;
    }

    .range-slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .value-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 16px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .current-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .unit {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .slider-container {
      position: relative;
      padding: 16px 0;
    }

    .range-slider {
      width: 100%;
      height: 6px;
      background: rgba(26, 26, 46, 0.5);
      border-radius: 3px;
      outline: none;
      appearance: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .range-slider::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      transition: all 0.2s ease;
    }

    .range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .range-slider::-webkit-slider-thumb:active {
      transform: scale(1.2);
    }

    .range-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      transition: all 0.2s ease;
    }

    .range-slider::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .range-slider::-moz-range-track {
      width: 100%;
      height: 6px;
      background: rgba(26, 26, 46, 0.5);
      border-radius: 3px;
      border: none;
    }

    .range-slider:focus {
      outline: none;
    }

    .range-slider:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .range-slider:focus::-moz-range-thumb {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .range-slider.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .range-slider.disabled::-webkit-slider-thumb {
      cursor: not-allowed;
    }

    .range-slider.disabled::-moz-range-thumb {
      cursor: not-allowed;
    }

    .range-slider.error {
      background: rgba(239, 68, 68, 0.2);
    }

    .range-slider.error::-webkit-slider-thumb {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .range-slider.error::-moz-range-thumb {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .range-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .min-label,
    .max-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .input-field {
      display: flex;
      justify-content: center;
    }

    .number-input {
      width: 80px;
      padding: 8px 12px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      color: var(--text-primary);
      text-align: center;
      font-size: 14px;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }

    .number-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .number-input.error {
      border-color: #ef4444;
    }

    .number-input.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true
    }
  ]
})
export class RangeSliderComponent implements OnInit, ControlValueAccessor {
  /**
   * Label text
   */
  @Input() label: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Minimum value
   */
  @Input() min: number = 0;

  /**
   * Maximum value
   */
  @Input() max: number = 100;

  /**
   * Step value
   */
  @Input() step: number = 1;

  /**
   * Unit text
   */
  @Input() unit: string = '';

  /**
   * Show input field
   */
  @Input() showInput: boolean = false;

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Decimal precision
   */
  @Input() precision: number = 0;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<number>();

  /**
   * Current value
   */
  value: number = 0;

  /**
   * Unique slider ID
   */
  sliderId: string = `range-slider-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.sliderId}-error`;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: number) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Initialize with min value if not set
    if (this.value < this.min) {
      this.value = this.min;
    }
  }

  /**
   * Get display value with precision
   */
  get displayValue(): string {
    if (this.precision > 0) {
      return this.value.toFixed(this.precision);
    }
    return this.value.toString();
  }

  /**
   * Handle value change
   */
  onValueChange(value: number): void {
    // Clamp value to min/max range
    const clampedValue = Math.max(this.min, Math.min(this.max, value));

    // Round to step precision
    const steppedValue = Math.round(clampedValue / this.step) * this.step;

    this.value = steppedValue;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.value = value || this.min;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

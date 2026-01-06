/**
 * Glass Input Component
 *
 * An input component with glass morphism styling.
 * Implements ControlValueAccessor for Angular forms integration.
 * Supports labels, validation, hints, and accessibility.
 *
 * @example
 * ```html
 * <app-glass-input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   [required]="true"
 *   [(ngModel)]="email"
 *   error="Please enter a valid email">
 * </app-glass-input>
 * ```
 */
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-glass-input',
  standalone: true,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GlassInputComponent),
    multi: true
  }],
  template: `
    <div class="w-full" [ngClass]="customClass">
      <label
        *ngIf="label"
        [for]="inputId"
        class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-error-500" aria-label="required">*</span>
      </label>
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [value]="value"
        [attr.aria-label]="ariaLabel || label"
        [attr.aria-required]="required"
        [attr.aria-invalid]="!!error"
        [attr.aria-describedby]="error ? errorId : (hint ? hintId : null)"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="glass-input w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <p
        *ngIf="error"
        [id]="errorId"
        class="text-red-500 text-sm mt-1"
        role="alert"
        aria-live="polite">{{ error }}</p>
      <p
        *ngIf="hint && !error"
        [id]="hintId"
        class="text-gray-500 text-sm mt-1">{{ hint }}</p>
    </div>
  `,
  styles: []
})
export class GlassInputComponent implements ControlValueAccessor {
  /**
   * Input label
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Input type
   * @default 'text'
   */
  @Input() type: string = 'text';

  /**
   * Placeholder text
   * @default ''
   */
  @Input() placeholder: string = '';

  /**
   * Whether the input is required
   * @default false
   */
  @Input() required: boolean = false;

  /**
   * Whether the input is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Error message to display
   * @default ''
   */
  @Input() error: string = '';

  /**
   * Hint text to display
   * @default ''
   */
  @Input() hint: string = '';

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for accessibility (overrides label if provided)
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Unique ID for the input (auto-generated if not provided)
   * @default ''
   */
  @Input() inputId: string = `glass-input-${Math.random().toString(36).substr(2, 9)}`;

  value: string = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  /**
   * Get error ID for ARIA describedby
   */
  get errorId(): string {
    return `${this.inputId}-error`;
  }

  /**
   * Get hint ID for ARIA describedby
   */
  get hintId(): string {
    return `${this.inputId}-hint`;
  }

  /**
   * Write value from form control
   */
  writeValue(value: string | null): void {
    this.value = value || '';
  }

  /**
   * Register change callback
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Register touched callback
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

  /**
   * Handle input event
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }
}


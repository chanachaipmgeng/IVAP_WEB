/**
 * Form Field Component
 *
 * A flexible form field component that supports multiple input types.
 * Provides consistent styling and validation display across different field types.
 *
 * @example
 * ```html
 * <app-form-field
 *   [config]="{
 *     key: 'email',
 *     label: 'Email Address',
 *     type: 'email',
 *     required: true,
 *     placeholder: 'Enter your email'
 *   }"
 *   (valueChange)="onFieldChange($event)">
 * </app-form-field>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'date' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  value?: string | number | boolean | null;
  error?: string;
  hint?: string;
  fullWidth?: boolean; // If true, spans full width in grid
  rows?: number; // For textarea
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div [class]="colSpan" class="w-full">
      @if (config.type !== 'checkbox') {
        <label
          [for]="fieldId"
          class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {{ config.label }}
          @if (config.required) {
            <span class="text-red-500" aria-label="required">*</span>
          }
        </label>
      }

      <!-- Text/Email/Password/Number Input -->
      @if (['text', 'email', 'password', 'number'].includes(config.type)) {
        <input
          [id]="fieldId"
          [(ngModel)]="config.value"
          [type]="config.type"
          class="glass-input w-full"
          [placeholder]="config.placeholder"
          [required]="config.required ?? false"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || config.label"
          [attr.aria-required]="config.required ?? false"
          [attr.aria-invalid]="!!config.error"
          [attr.aria-describedby]="config.error ? errorId : (config.hint ? hintId : null)"
          [class.border-error-500]="config.error"
          (ngModelChange)="onValueChange($event)"
        />
      }

      <!-- Date Input -->
      @if (config.type === 'date') {
        <input
          [id]="fieldId"
          [(ngModel)]="config.value"
          type="date"
          class="glass-input w-full"
          [required]="config.required ?? false"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || config.label"
          [attr.aria-required]="config.required ?? false"
          [attr.aria-invalid]="!!config.error"
          [attr.aria-describedby]="config.error ? errorId : (config.hint ? hintId : null)"
          [class.border-error-500]="config.error"
          (ngModelChange)="onValueChange($event)"
        />
      }

      <!-- Select -->
      @if (config.type === 'select') {
        <select
          [id]="fieldId"
          [(ngModel)]="config.value"
          class="glass-input w-full"
          [required]="config.required ?? false"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || config.label"
          [attr.aria-required]="config.required ?? false"
          [attr.aria-invalid]="!!config.error"
          [attr.aria-describedby]="config.error ? errorId : (config.hint ? hintId : null)"
          [class.border-error-500]="config.error"
          (ngModelChange)="onValueChange($event)"
        >
          <option value="">{{ 'components.forms.select' | translate }}</option>
          @for (option of config.options; track option.value) {
            <option [value]="option.value">
              {{ option.label }}
            </option>
          }
        </select>
      }

      <!-- Textarea -->
      @if (config.type === 'textarea') {
        <textarea
          [id]="fieldId"
          [(ngModel)]="config.value"
          class="glass-input w-full"
          [rows]="config.rows || 3"
          [placeholder]="config.placeholder"
          [required]="config.required ?? false"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || config.label"
          [attr.aria-required]="config.required ?? false"
          [attr.aria-invalid]="!!config.error"
          [attr.aria-describedby]="config.error ? errorId : (config.hint ? hintId : null)"
          [class.border-error-500]="config.error"
          (ngModelChange)="onValueChange($event)"
        ></textarea>
      }

      <!-- Checkbox -->
      @if (config.type === 'checkbox') {
        <label
          [for]="fieldId"
          class="flex items-center space-x-2">
          <input
            [id]="fieldId"
            [(ngModel)]="config.value"
            type="checkbox"
            class="rounded"
            [required]="config.required ?? false"
            [disabled]="disabled"
            [attr.aria-label]="ariaLabel || config.label"
            [attr.aria-required]="config.required ?? false"
            (ngModelChange)="onValueChange($event)"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ config.label }}
            @if (config.required) {
              <span class="text-error-500" aria-label="required">*</span>
            }
          </span>
        </label>
      }

      <!-- Error Message -->
      @if (config.error) {
        <p
          [id]="errorId"
          class="mt-1 text-sm text-error-600 dark:text-error-400"
          role="alert"
          aria-live="polite">
          {{ config.error }}
        </p>
      }

      <!-- Hint Message -->
      @if (config.hint && !config.error) {
        <p
          [id]="hintId"
          class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ config.hint }}
        </p>
      }
    </div>
  `,
  styles: []
})
export class FormFieldComponent {
  /**
   * Form field configuration
   */
  @Input() config!: FormFieldConfig;

  /**
   * Column span class for grid layout
   * @default 'md:col-span-1'
   */
  @Input() colSpan: string = 'md:col-span-1';

  /**
   * Whether the field is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * ARIA label for accessibility (overrides config.label if provided)
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Unique ID for the field (auto-generated if not provided)
   * @default ''
   */
  @Input() fieldId: string = `form-field-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Emitted when field value changes
   */
  @Output() valueChange = new EventEmitter<{ key: string; value: string | number | boolean | null }>();

  /**
   * Get error ID for ARIA describedby
   */
  get errorId(): string {
    return `${this.fieldId}-error`;
  }

  /**
   * Get hint ID for ARIA describedby
   */
  get hintId(): string {
    return `${this.fieldId}-hint`;
  }

  /**
   * Handle field value change
   */
  onValueChange(value: string | number | boolean | null): void {
    this.valueChange.emit({ key: this.config.key, value });
  }
}


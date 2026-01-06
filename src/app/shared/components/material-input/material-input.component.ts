/**
 * Material Input Component
 *
 * A Material Design input component wrapper using Angular Material.
 * Provides a form input with label, icons, hints, and error messages.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-material-input
 *   [label]="'Email'"
 *   [type]="'email'"
 *   [placeholder]="'Enter email'"
 *   [required]="true"
 *   [customClass]="'my-input'"
 *   [ariaLabel]="'Email address'"
 *   [(ngModel)]="email"
 *   (valueChange)="onEmailChange($event)">
 * </app-material-input>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-material-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field
      [class]="customClass"
      [appearance]="appearance"
      [floatLabel]="floatLabel">
      <mat-label *ngIf="label">{{ label }}</mat-label>
      <mat-icon *ngIf="prefixIcon" matPrefix [class]="iconClass" [attr.aria-hidden]="'true'">{{ prefixIcon }}</mat-icon>
      <input
        matInput
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [maxlength]="maxLength"
        [minlength]="minLength"
        [pattern]="pattern"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        [class]="inputClass"
        [attr.aria-label]="ariaLabel || label || 'Input'"
        [attr.aria-required]="required ? 'true' : null"
        [attr.aria-invalid]="errorMessage ? 'true' : null"
        [attr.aria-describedby]="errorMessage ? errorId : (hint ? hintId : null)">
      <mat-icon *ngIf="suffixIcon" matSuffix [class]="iconClass" [attr.aria-hidden]="'true'">{{ suffixIcon }}</mat-icon>
      <mat-hint *ngIf="hint" [align]="hintAlign" [id]="hintId">{{ hint }}</mat-hint>
      <mat-error *ngIf="errorMessage" [id]="errorId" role="alert" [attr.aria-live]="'polite'">{{ errorMessage }}</mat-error>
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialInputComponent),
      multi: true
    }
  ],
  styles: [`
    mat-form-field {
      width: 100%;
    }

    .gemini-glow {
      animation: material-glow 3s ease-in-out infinite;
    }
  `]
})
export class MaterialInputComponent implements ControlValueAccessor {
  /**
   * Input label
   */
  @Input() label: string = '';

  /**
   * Placeholder text
   */
  @Input() placeholder: string = '';

  /**
   * Input type
   */
  @Input() type: string = 'text';

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Maximum length
   */
  @Input() maxLength: number | null = null;

  /**
   * Minimum length
   */
  @Input() minLength: number | null = null;

  /**
   * Validation pattern
   */
  @Input() pattern: string = '';

  /**
   * Form field appearance
   */
  @Input() appearance: 'fill' | 'outline' = 'outline';

  /**
   * Float label behavior
   */
  @Input() floatLabel: 'always' | 'auto' = 'auto';

  /**
   * Prefix icon name
   */
  @Input() prefixIcon: string = '';

  /**
   * Suffix icon name
   */
  @Input() suffixIcon: string = '';

  /**
   * Hint text
   */
  @Input() hint: string = '';

  /**
   * Hint alignment
   */
  @Input() hintAlign: 'start' | 'end' = 'start';

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Input CSS classes
   */
  @Input() inputClass: string = '';

  /**
   * Icon CSS classes
   */
  @Input() iconClass: string = '';

  /**
   * ARIA label for the input
   */
  @Input() ariaLabel?: string;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * Blur event
   */
  @Output() blur = new EventEmitter<void>();

  /**
   * Focus event
   */
  @Output() focus = new EventEmitter<void>();

  /**
   * Current input value
   */
  value: string = '';

  /**
   * Unique hint ID
   */
  hintId: string = `material-input-hint-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `material-input-error-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: string) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  /**
   * Write value from form control
   */
  writeValue(value: string): void {
    this.value = value || '';
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: string) => void): void {
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

  /**
   * Handle value change
   */
  onValueChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  /**
   * Handle focus event
   */
  onFocus(): void {
    this.focus.emit();
  }
}


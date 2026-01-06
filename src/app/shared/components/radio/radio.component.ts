/**
 * Radio Component
 *
 * A customizable radio button component.
 * Implements ControlValueAccessor for Angular forms integration.
 * Should be used within a mat-radio-group for proper functionality.
 *
 * @example
 * ```html
 * <mat-radio-group [(ngModel)]="selectedValue">
 *   <app-radio
 *     label="Option 1"
 *     value="option1"
 *     [disabled]="isLoading">
 *   </app-radio>
 *   <app-radio
 *     label="Option 2"
 *     value="option2">
 *   </app-radio>
 * </mat-radio-group>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioModule, MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, MatRadioModule],
  template: `
    <mat-radio-button
      [value]="value"
      [disabled]="disabled"
      [required]="required"
      [color]="color"
      [class]="customClass"
      [checked]="isChecked"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-required]="required"
      [attr.aria-checked]="isChecked"
      (change)="onChange($event)">
      <ng-content></ng-content>
      <span *ngIf="label && !hasContent">{{ label }}</span>
    </mat-radio-button>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  styles: [`
    :host {
      display: inline-block;
    }

    mat-radio-button {
      display: block;
    }
  `]
})
export class RadioComponent implements ControlValueAccessor {
  /**
   * Radio button label text
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Radio button value
   * @default undefined
   */
  @Input() value: string | number | undefined;

  /**
   * Whether radio button is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Whether radio button is required
   * @default false
   */
  @Input() required: boolean = false;

  /**
   * Radio button color theme
   * @default 'primary'
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

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
   * Emitted when radio button value changes
   */
  @Output() valueChange = new EventEmitter<string | number>();

  hasContent: boolean = false;
  isChecked: boolean = false;
  private onChangeFn = (value: string | number) => {};
  private onTouchedFn = () => {};

  ngAfterContentInit(): void {
    this.hasContent = true;
  }

  /**
   * Handle radio button change event
   */
  onChange(event: MatRadioChange): void {
    // MatRadioChange has 'value' property, not 'checked'
    // If this radio's value matches the selected value, it's checked
    if (event.value === this.value && this.value !== undefined) {
      this.isChecked = true;
      this.onChangeFn(this.value);
      this.valueChange.emit(this.value);
    } else {
      this.isChecked = false;
    }
  }

  /**
   * Write value from form control
   */
  writeValue(value: string | number | null): void {
    this.isChecked = value === this.value;
  }

  /**
   * Register change callback
   */
  registerOnChange(fn: (value: string | number) => void): void {
    this.onChangeFn = fn;
  }

  /**
   * Register touched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

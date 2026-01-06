/**
 * Checkbox Component
 *
 * A customizable checkbox component with support for indeterminate state.
 * Implements ControlValueAccessor for Angular forms integration.
 *
 * @example
 * ```html
 * <app-checkbox
 *   label="Accept terms"
 *   [checked]="isAccepted"
 *   [required]="true"
 *   [disabled]="isLoading"
 *   (checkedChange)="onCheckboxChange($event)">
 * </app-checkbox>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule],
  template: `
    <mat-checkbox
      [checked]="checked"
      [indeterminate]="indeterminate"
      [disabled]="disabled"
      [required]="required"
      [color]="color"
      [labelPosition]="labelPosition"
      [class]="customClass"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-required]="required"
      [attr.aria-checked]="indeterminate ? 'mixed' : checked"
      (change)="onChange($event)"
      (indeterminateChange)="onIndeterminateChange($event)">
      <ng-content></ng-content>
      <span *ngIf="label && !hasContent">{{ label }}</span>
    </mat-checkbox>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  styles: [`
    :host {
      display: inline-block;
    }

    mat-checkbox {
      display: block;
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  /**
   * Checkbox label text
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Whether checkbox is checked
   * @default false
   */
  @Input() checked: boolean = false;

  /**
   * Whether checkbox is in indeterminate state
   * @default false
   */
  @Input() indeterminate: boolean = false;

  /**
   * Whether checkbox is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Whether checkbox is required
   * @default false
   */
  @Input() required: boolean = false;

  /**
   * Checkbox color theme
   * @default 'primary'
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Label position relative to checkbox
   * @default 'after'
   */
  @Input() labelPosition: 'before' | 'after' = 'after';

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
   * Emitted when checked state changes
   */
  @Output() checkedChange = new EventEmitter<boolean>();

  /**
   * Emitted when indeterminate state changes
   */
  @Output() indeterminateChange = new EventEmitter<boolean>();

  hasContent: boolean = false;
  private onChangeFn = (value: boolean) => {};
  private onTouchedFn = () => {};

  ngAfterContentInit(): void {
    this.hasContent = true;
  }

  /**
   * Handle checkbox change event
   */
  onChange(event: MatCheckboxChange): void {
    this.checked = event.checked;
    this.onChangeFn(this.checked);
    this.checkedChange.emit(this.checked);
  }

  /**
   * Handle indeterminate state change
   */
  onIndeterminateChange(indeterminate: boolean): void {
    this.indeterminate = indeterminate;
    this.indeterminateChange.emit(indeterminate);
  }

  /**
   * Write value from form control
   */
  writeValue(value: boolean | null): void {
    this.checked = value || false;
  }

  /**
   * Register change callback
   */
  registerOnChange(fn: (value: boolean) => void): void {
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

/**
 * Switch/Toggle Component
 *
 * A customizable switch/toggle component.
 * Implements ControlValueAccessor for Angular forms integration.
 *
 * @example
 * ```html
 * <app-switch
 *   label="Enable notifications"
 *   [checked]="notificationsEnabled"
 *   [disabled]="isLoading"
 *   (checkedChange)="onSwitchChange($event)">
 * </app-switch>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSlideToggleModule],
  template: `
    <mat-slide-toggle
      [checked]="checked"
      [disabled]="disabled"
      [required]="required"
      [color]="color"
      [labelPosition]="labelPosition"
      [class]="customClass"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-required]="required"
      [attr.aria-checked]="checked"
      (change)="onChange($event)">
      <ng-content></ng-content>
      <span *ngIf="label && !hasContent">{{ label }}</span>
    </mat-slide-toggle>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ],
  styles: [`
    :host {
      display: inline-block;
    }

    mat-slide-toggle {
      display: block;
    }
  `]
})
export class SwitchComponent implements ControlValueAccessor {
  /**
   * Switch label text
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Whether switch is checked
   * @default false
   */
  @Input() checked: boolean = false;

  /**
   * Whether switch is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Whether switch is required
   * @default false
   */
  @Input() required: boolean = false;

  /**
   * Switch color theme
   * @default 'primary'
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Label position relative to switch
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

  hasContent: boolean = false;
  private onChangeFn = (value: boolean) => {};
  private onTouchedFn = () => {};

  ngAfterContentInit(): void {
    this.hasContent = true;
  }

  /**
   * Handle switch change event
   */
  onChange(event: MatSlideToggleChange): void {
    this.checked = event.checked;
    this.onChangeFn(this.checked);
    this.checkedChange.emit(this.checked);
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

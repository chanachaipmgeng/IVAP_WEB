/**
 * Date Time Picker Component
 *
 * A date and time picker component using Flatpickr for selecting dates, times, or both.
 * Supports multiple formats, ranges, timezones, and validation.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-date-time-picker
 *   [label]="'Select Date'"
 *   [type]="'date'"
 *   [value]="selectedDate"
 *   [required]="true"
 *   (valueChange)="onDateChange($event)">
 * </app-date-time-picker>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrModule],
  template: `
    <div class="date-time-picker-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'Date time picker'">
      <label *ngIf="label" [for]="inputId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1" [attr.aria-label]="'Required'">*</span>
      </label>

      <div class="date-time-picker-wrapper">
        <input
          [id]="inputId"
          [ngModel]="value"
          (ngModelChange)="onValueChange($event)"
          [disabled]="disabled"
          [placeholder]="placeholder"
          class="date-time-input"
          [class.error]="errorMessage"
          [class.disabled]="disabled"
          [attr.aria-label]="ariaLabel || label || 'Date time picker'"
          [attr.aria-required]="required ? 'true' : null"
          [attr.aria-invalid]="errorMessage ? 'true' : null"
          [attr.aria-describedby]="errorMessage ? errorId : null"
          [attr.type]="'text'"
          [attr.readonly]="!allowInput ? 'true' : null">
        <div class="date-time-icon" [attr.aria-hidden]="true">
          <span *ngIf="type === 'date'">📅</span>
          <span *ngIf="type === 'time'">🕐</span>
          <span *ngIf="type === 'datetime'">📅</span>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'polite'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .date-time-picker-container {
      width: 100%;
    }

    .date-time-picker-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .date-time-input {
      width: 100%;
      padding: 12px 16px;
      padding-right: 48px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(20px);
      transition: all 0.2s ease;
    }

    .date-time-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .date-time-input:hover:not(:disabled) {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .date-time-input.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(26, 26, 46, 0.5);
    }

    .date-time-input.error {
      border-color: #ef4444;
    }

    .date-time-input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .date-time-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      pointer-events: none;
      color: var(--text-muted);
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* Flatpickr custom styling */
    ::ng-deep .flatpickr-calendar {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
      backdrop-filter: blur(20px) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-month {
      background: rgba(26, 26, 46, 0.9) !important;
      color: var(--text-primary) !important;
      border-radius: 12px 12px 0 0 !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-weekdays {
      background: rgba(26, 26, 46, 0.8) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-weekday {
      color: var(--text-secondary) !important;
      font-weight: 600 !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-day {
      color: var(--text-primary) !important;
      border: 1px solid transparent !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-day:hover {
      background: rgba(59, 130, 246, 0.1) !important;
      border-color: rgba(59, 130, 246, 0.3) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-day.selected {
      background: #3b82f6 !important;
      border-color: #3b82f6 !important;
      color: white !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-day.today {
      border-color: #3b82f6 !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-day.today.selected {
      background: #3b82f6 !important;
      color: white !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-time {
      background: rgba(26, 26, 46, 0.9) !important;
      border-top: 1px solid var(--glass-border) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-time input {
      background: transparent !important;
      color: var(--text-primary) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-time input:hover {
      background: rgba(59, 130, 246, 0.1) !important;
    }

    ::ng-deep .flatpickr-calendar .flatpickr-time input:focus {
      background: rgba(59, 130, 246, 0.1) !important;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = '';
  @Input() customClass?: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() type: 'date' | 'time' | 'datetime' = 'date';
  @Input() minDate: string | Date | null = null;
  @Input() maxDate: string | Date | null = null;
  @Input() errorMessage: string = '';
  @Input() format: string = 'Y-m-d';
  @Input() timeFormat: string = 'H:i';
  @Input() enableTime: boolean = false;
  @Input() enableSeconds: boolean = false;
  @Input() allowInput: boolean = true;
  @Input() clickOpens: boolean = true;
  @Input() closeOnSelect: boolean = true;
  @Input() weekNumbers: boolean = false;
  @Input() locale: string = 'en';

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<string | Date | null>();

  /**
   * Current value
   */
  value: string | Date | null = null;

  /**
   * Flatpickr options
   */
  flatpickrOptions: Record<string, unknown> = {};

  /**
   * Unique input ID
   */
  inputId: string = `date-time-input-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.inputId}-error`;

  // ControlValueAccessor
  private onChange = (value: string | Date | null) => {};
  private onTouched = () => {};

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeFlatpickrOptions();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Initialize Flatpickr options
   */
  private initializeFlatpickrOptions(): void {
    this.flatpickrOptions = {
      enableTime: this.type === 'time' || this.type === 'datetime',
      enableSeconds: this.enableSeconds,
      time_24hr: true,
      allowInput: this.allowInput,
      clickOpens: this.clickOpens,
      closeOnSelect: this.closeOnSelect,
      weekNumbers: this.weekNumbers,
      locale: this.locale,
      minDate: this.minDate,
      maxDate: this.maxDate,
      dateFormat: this.getDateFormat(),
      timeFormat: this.timeFormat,
      onOpen: () => {
        this.onTouched();
      },
      onChange: (selectedDates: Date[], dateStr: string) => {
        const value = selectedDates.length > 0 ? selectedDates[0] : null;
        this.onValueChange(value);
      }
    };
  }

  private getDateFormat(): string {
    switch (this.type) {
      case 'date':
        return 'Y-m-d';
      case 'time':
        return 'H:i';
      case 'datetime':
        return 'Y-m-d H:i';
      default:
        return this.format;
    }
  }

  /**
   * Handle value change
   */
  onValueChange(value: string | Date | null): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  /**
   * Write value from form control
   */
  writeValue(value: string | Date | null): void {
    this.value = value;
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: string | Date | null) => void): void {
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

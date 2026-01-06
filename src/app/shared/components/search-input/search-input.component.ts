/**
 * Search Input Component
 *
 * A search input component with icon, clear button, and debouncing support.
 * Implements ControlValueAccessor for Angular forms integration.
 * Provides accessibility features and customizable styling.
 *
 * @example
 * ```html
 * <app-search-input
 *   label="Search"
 *   placeholder="Type to search..."
 *   [debounceTime]="300"
 *   [showClearButton]="true"
 *   (search)="onSearch($event)"
 *   (clear)="onClear()">
 * </app-search-input>
 * ```
 */

import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div [class]="getSearchClasses()" [attr.aria-label]="ariaLabel || label || 'Search input'">
      <mat-form-field [appearance]="appearance" [class]="fieldClass">
        <mat-label *ngIf="label">{{ label }}</mat-label>
        <mat-icon matPrefix [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
        <input
          matInput
          [id]="inputIdValue"
          type="text"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label || placeholder"
          [attr.aria-required]="required"
          [attr.aria-invalid]="hasError"
          [attr.aria-describedby]="getAriaDescribedBy()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [class]="inputClass">
        <button
          *ngIf="value && showClearButton"
          mat-icon-button
          matSuffix
          type="button"
          (click)="onClear()"
          [attr.aria-label]="'Clear search'"
          [attr.aria-describedby]="inputIdValue">
          <mat-icon [attr.aria-hidden]="true">close</mat-icon>
        </button>
      </mat-form-field>
      @if (error) {
        <div [id]="errorId" class="error-message" role="alert" aria-live="polite">
          {{ error }}
        </div>
      }
      @if (hint && !error) {
        <div [id]="hintId" class="hint-message">
          {{ hint }}
        </div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true
    }
  ],
  styles: [`
    :host {
      display: block;
    }

    mat-form-field {
      width: 100%;
    }

    .search-input-full-width {
      width: 100%;
    }

    .search-input-sm {
      max-width: 200px;
    }

    .search-input-md {
      max-width: 300px;
    }

    .search-input-lg {
      max-width: 400px;
    }
  `]
})
export class SearchInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  /**
   * Input label
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Placeholder text
   * @default 'Search...'
   */
  @Input() placeholder: string = 'Search...';

  /**
   * Icon name (Material icon)
   * @default 'search'
   */
  @Input() icon: string = 'search';

  /**
   * Material form field appearance
   * @default 'outline'
   */
  @Input() appearance: 'fill' | 'outline' = 'outline';

  /**
   * Whether input is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Debounce time in milliseconds
   * @default 300
   */
  @Input() debounceTime: number = 300;

  /**
   * Whether to show clear button
   * @default true
   */
  @Input() showClearButton: boolean = true;

  /**
   * Input size
   * @default 'md'
   */
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';

  /**
   * Additional CSS classes for container
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * Additional CSS classes for form field
   * @default ''
   */
  @Input() fieldClass: string = '';

  /**
   * Additional CSS classes for input
   * @default ''
   */
  @Input() inputClass: string = '';

  /**
   * Additional CSS classes for icon
   * @default ''
   */
  @Input() iconClass: string = '';

  /**
   * ARIA label for accessibility
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Whether input is required
   * @default false
   */
  @Input() required: boolean = false;

  /**
   * Error message
   */
  @Input() error?: string;

  /**
   * Hint text
   */
  @Input() hint?: string;

  /**
   * Custom input ID (auto-generated if not provided)
   */
  @Input() inputId?: string;

  /**
   * Emitted when input value changes
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * Emitted when search is performed (after debounce)
   */
  @Output() search = new EventEmitter<string>();

  /**
   * Emitted when clear button is clicked
   */
  @Output() clear = new EventEmitter<void>();

  /**
   * Emitted when input receives focus
   */
  @Output() focus = new EventEmitter<void>();

  /**
   * Emitted when input loses focus
   */
  @Output() blur = new EventEmitter<void>();

  value: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private onChangeFn = (value: string) => {};
  private onTouchedFn = () => {};

  /**
   * Unique ID for input (auto-generated)
   */
  get inputIdValue(): string {
    return this.inputId || `search-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Unique ID for error message
   */
  get errorId(): string {
    return `${this.inputIdValue}-error`;
  }

  /**
   * Unique ID for hint message
   */
  get hintId(): string {
    return `${this.inputIdValue}-hint`;
  }

  /**
   * Whether input has error
   */
  get hasError(): boolean {
    return !!this.error;
  }

  constructor() {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value);
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }

  /**
   * Get ARIA describedby value
   */
  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.error) {
      ids.push(this.errorId);
    }
    if (this.hint && !this.error) {
      ids.push(this.hintId);
    }
    return ids.length > 0 ? ids.join(' ') : null;
  }

  /**
   * Get search container classes
   */
  getSearchClasses(): string {
    const classes = ['search-input'];
    classes.push(`search-input-${this.size}`);
    if (this.customClass) {
      classes.push(this.customClass);
    }
    return classes.join(' ');
  }

  /**
   * Handle input event
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChangeFn(this.value);
    this.valueChange.emit(this.value);
    this.searchSubject.next(this.value);
  }

  /**
   * Handle clear button click
   */
  onClear(): void {
    this.value = '';
    this.onChangeFn('');
    this.valueChange.emit('');
    this.search.emit('');
    this.clear.emit();
  }

  /**
   * Handle focus event
   */
  onFocus(): void {
    this.focus.emit();
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this.onTouchedFn();
    this.blur.emit();
  }

  // ControlValueAccessor implementation

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

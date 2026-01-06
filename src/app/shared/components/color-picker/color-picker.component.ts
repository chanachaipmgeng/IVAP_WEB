/**
 * Color Picker Component
 *
 * A customizable color picker component for selecting colors.
 * Supports preset colors, custom color input, and native color picker.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-color-picker
 *   [label]="'Background Color'"
 *   [value]="backgroundColor"
 *   [presetColors]="colorPresets"
 *   (valueChange)="onColorChange($event)">
 * </app-color-picker>
 * ```
 */

import { Component, Input, OnInit, forwardRef, HostListener, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-picker-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'Color picker'">
      <label *ngIf="label" [for]="colorInputId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
      </label>

      <div class="color-picker-wrapper">
        <!-- Color Preview -->
        <div
          class="color-preview"
          [style.background-color]="value || 'var(--color-primary-500)'"
          (click)="togglePicker()"
          [class.disabled]="disabled"
          role="button"
          [attr.aria-label]="'Color preview: ' + (value || fallbackColor)"
          [attr.aria-expanded]="showPicker ? 'true' : 'false'"
          [attr.aria-haspopup]="'true'"
          [attr.aria-controls]="showPicker ? pickerDropdownId : null"
          [attr.tabindex]="disabled ? -1 : 0"
          (keydown.enter)="togglePicker()"
          (keydown.space)="togglePicker(); $event.preventDefault()">
          <span class="color-text" [attr.aria-hidden]="true">{{ value || fallbackColor }}</span>
        </div>

        <!-- Color Input -->
        <input
          *ngIf="!hideTextInput"
          [id]="colorInputId"
          type="text"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          [disabled]="disabled"
          class="color-input"
          placeholder="#3b82f6"
          maxlength="7"
          pattern="^#[0-9A-Fa-f]{6}$"
          [attr.aria-label]="'Color hex value'"
          [attr.aria-invalid]="errorMessage ? 'true' : null"
          [attr.aria-describedby]="errorMessage ? errorId : null"
        />

        <!-- Native Color Picker -->
        <input
          type="color"
          [value]="value || fallbackColor"
          (input)="onColorInputChange($event)"
          [disabled]="disabled"
          class="native-color-picker"
          #colorInput
          [attr.aria-label]="'Native color picker'"
          [attr.aria-hidden]="false"
        />

        <!-- Color Picker Dropdown -->
        <div
          *ngIf="showPicker && !disabled"
          [id]="pickerDropdownId"
          class="color-picker-dropdown"
          #pickerDropdown
          role="dialog"
          [attr.aria-label]="'Color picker'"
          [attr.aria-labelledby]="label ? colorInputId : null">
          <!-- Preset Colors -->
          <div *ngIf="!hidePresets && presetColors.length > 0" class="preset-colors" role="group" [attr.aria-label]="'Preset colors'">
            <div
              *ngFor="let color of presetColors; trackBy: trackByColor"
              class="preset-color"
              [style.background-color]="color"
              [class.active]="value === color"
              (click)="selectPresetColor(color)"
              [title]="color"
              role="button"
              [attr.aria-label]="'Select color ' + color"
              [attr.aria-pressed]="value === color ? 'true' : 'false'"
              [attr.tabindex]="0"
              (keydown.enter)="selectPresetColor(color)"
              (keydown.space)="selectPresetColor(color); $event.preventDefault()">
            </div>
          </div>

          <!-- Custom Color Input -->
          <div *ngIf="!hideColorPicker" class="custom-color-section" role="group" [attr.aria-label]="'Custom color'">
            <label [for]="customColorInputId" class="custom-color-label">Custom Color:</label>
            <div class="custom-color-inputs">
              <input
                [id]="customColorInputId"
                type="text"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                class="hex-input"
                placeholder="#000000"
                maxlength="7"
                pattern="^#[0-9A-Fa-f]{6}$"
                [attr.aria-label]="'Hex color value'"
                [attr.aria-invalid]="errorMessage ? 'true' : null"
                [attr.aria-describedby]="errorMessage ? errorId : null"
              />
              <input
                type="color"
                [value]="value || fallbackColor"
                (input)="onColorInputChange($event)"
                class="color-picker-input"
                [attr.aria-label]="'Color picker'"
                [attr.aria-hidden]="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'polite'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .color-picker-container {
      width: 100%;
      position: relative;
    }

    .color-picker-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    .color-preview:hover:not(.disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .color-preview.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .color-text {
      font-size: 10px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      text-align: center;
      line-height: 1;
    }

    .color-input {
      flex: 1;
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 14px;
      font-family: monospace;
      min-width: 100px;
    }

    .color-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .color-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .native-color-picker {
      width: 40px;
      height: 40px;
      border: 2px solid var(--glass-border);
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      padding: 0;
    }

    .native-color-picker::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .native-color-picker::-webkit-color-swatch {
      border: none;
      border-radius: 6px;
    }

    .native-color-picker:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .color-picker-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      padding: 16px;
      z-index: 1000;
      min-width: 280px;
    }

    .preset-colors {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .preset-color {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }

    .preset-color:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .preset-color.active {
      border: 2px solid #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .custom-color-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--glass-border);
    }

    .custom-color-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .custom-color-inputs {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .hex-input {
      flex: 1;
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 14px;
      font-family: monospace;
    }

    .hex-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .color-picker-input {
      width: 40px;
      height: 40px;
      border: 2px solid var(--glass-border);
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      padding: 0;
    }

    .color-picker-input::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .color-picker-input::-webkit-color-swatch {
      border: none;
      border-radius: 6px;
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
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements OnInit, ControlValueAccessor {
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
   * Hide text input
   */
  @Input() hideTextInput: boolean = false;

  /**
   * Hide color picker
   */
  @Input() hideColorPicker: boolean = false;

  /**
   * Hide preset colors
   */
  @Input() hidePresets: boolean = false;

  /**
   * Preset colors array
   */
  @Input() presetColors: string[] = [
    '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#000000', '#ffffff', '#6b7280', '#9ca3af', '#d1d5db'
  ];

  /**
   * Dropdown position
   */
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  /**
   * Color format
   */
  @Input() format: 'hex' | 'rgb' | 'hsl' = 'hex';

  /**
   * Alpha channel setting
   */
  @Input() alphaChannel: 'enabled' | 'disabled' = 'disabled';

  /**
   * Output format
   */
  @Input() outputFormat: 'hex' | 'rgb' | 'hsl' = 'hex';

  /**
   * Fallback color
   */
  @Input() fallbackColor: string = '#3b82f6';

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * Picker dropdown element reference
   */
  @ViewChild('pickerDropdown', { static: false }) pickerDropdown?: ElementRef;

  /**
   * Color input element reference
   */
  @ViewChild('colorInput', { static: false }) colorInput?: ElementRef<HTMLInputElement>;

  /**
   * Current color value
   */
  value: string = '#3b82f6';

  /**
   * Show picker flag
   */
  showPicker: boolean = false;

  /**
   * Unique color input ID
   */
  colorInputId: string = `color-input-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique custom color input ID
   */
  customColorInputId: string = `custom-color-input-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique picker dropdown ID
   */
  pickerDropdownId: string = `color-picker-dropdown-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.colorInputId}-error`;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: string) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Initialize with default value if not set
    if (!this.value) {
      this.value = this.fallbackColor;
    }
  }

  /**
   * Handle document click
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showPicker && this.pickerDropdown) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.showPicker = false;
      }
    }
  }

  /**
   * Toggle color picker
   */
  togglePicker(): void {
    if (!this.disabled) {
      this.showPicker = !this.showPicker;
    }
  }

  /**
   * Select preset color
   */
  selectPresetColor(color: string): void {
    this.value = color;
    this.onValueChange(color);
    this.showPicker = false;
  }

  /**
   * Handle color input change
   */
  onColorInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.value = input.value;
      this.onValueChange(input.value);
    }
  }

  /**
   * Handle value change
   */
  onValueChange(value: string): void {
    // Validate hex color format
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      this.value = value;
      this.onChange(value);
      this.onTouched();
      this.valueChange.emit(value);
    } else if (value === '') {
      this.value = this.fallbackColor;
      this.onChange(this.fallbackColor);
      this.onTouched();
      this.valueChange.emit(this.fallbackColor);
    }
  }

  /**
   * TrackBy function for preset colors
   */
  trackByColor(index: number, color: string): string {
    return color;
  }

  /**
   * Write value from form control
   */
  writeValue(value: string): void {
    this.value = value || this.fallbackColor;
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
}

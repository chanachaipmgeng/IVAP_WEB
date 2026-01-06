/**
 * Filter Section Component
 *
 * Reusable filter section component with support for multiple field types (text, select, date, number).
 * Provides filter change events and optional action button.
 *
 * @example
 * ```html
 * <app-filter-section
 *   [fields]="filterFields"
 *   [actionButton]="filterAction"
 *   [columns]="4"
 *   (filterChange)="onFilterChange($event)">
 * </app-filter-section>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { GlassButtonComponent } from '../glass-button/glass-button.component';

/**
 * Filter field interface
 */
export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  value?: unknown;
  error?: string;
}

/**
 * Filter action button interface
 */
export interface FilterActionButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

@Component({
  selector: 'app-filter-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, GlassCardComponent, GlassButtonComponent],
  template: `
    <app-glass-card [customClass]="customClass || 'p-6'" [ariaLabel]="ariaLabel || 'Filter section'">
      <div [ngClass]="gridClasses" role="group" [attr.aria-label]="'Filter fields'">
        <div *ngFor="let field of fields; trackBy: trackByField">
          <label
            [for]="getFieldId(field.key)"
            class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {{ field.label }}
          </label>

          <!-- Text Input -->
          <input
            *ngIf="field.type === 'text'"
            [id]="getFieldId(field.key)"
            [(ngModel)]="field.value"
            type="text"
            class="glass-input w-full"
            [placeholder]="field.placeholder || ''"
            [disabled]="loading || false"
            [attr.aria-label]="field.label"
            [attr.aria-required]="field.error ? 'true' : null"
            [attr.aria-invalid]="field.error ? 'true' : null"
            [attr.aria-describedby]="field.error ? getFieldErrorId(field.key) : null"
            (ngModelChange)="onFieldChange(field.key, $event)"
            (keyup.enter)="onSearch(getFieldValueAsString(field))"
          />

          <!-- Number Input -->
          <input
            *ngIf="field.type === 'number'"
            [id]="getFieldId(field.key)"
            [(ngModel)]="field.value"
            type="number"
            class="glass-input w-full"
            [placeholder]="field.placeholder || ''"
            [disabled]="loading || false"
            [attr.aria-label]="field.label"
            [attr.aria-required]="field.error ? 'true' : null"
            [attr.aria-invalid]="field.error ? 'true' : null"
            [attr.aria-describedby]="field.error ? getFieldErrorId(field.key) : null"
            (ngModelChange)="onFieldChange(field.key, $event)"
          />

          <!-- Date Input -->
          <input
            *ngIf="field.type === 'date'"
            [id]="getFieldId(field.key)"
            [(ngModel)]="field.value"
            type="date"
            class="glass-input w-full"
            [disabled]="loading || false"
            [attr.aria-label]="field.label"
            [attr.aria-required]="field.error ? 'true' : null"
            [attr.aria-invalid]="field.error ? 'true' : null"
            [attr.aria-describedby]="field.error ? getFieldErrorId(field.key) : null"
            (ngModelChange)="onFieldChange(field.key, $event)"
          />

          <!-- Select -->
          <select
            *ngIf="field.type === 'select'"
            [id]="getFieldId(field.key)"
            [(ngModel)]="field.value"
            class="glass-input w-full"
            [disabled]="loading || false"
            [attr.aria-label]="field.label"
            [attr.aria-required]="field.error ? 'true' : null"
            [attr.aria-invalid]="field.error ? 'true' : null"
            [attr.aria-describedby]="field.error ? getFieldErrorId(field.key) : null"
            (ngModelChange)="onFieldChange(field.key, $event)"
          >
            <option value="">{{ 'common.all' | translate }}</option>
            <option *ngFor="let option of field.options; trackBy: trackByOption" [value]="option.value">
              {{ option.label }}
            </option>
          </select>

          <!-- Error Message -->
          <p
            *ngIf="field.error"
            [id]="getFieldErrorId(field.key)"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
            [attr.aria-live]="'polite'">
            {{ field.error }}
          </p>
        </div>

        <!-- Action Button -->
        <div class="flex items-end" *ngIf="actionButton">
          <app-glass-button
            [variant]="actionButton.variant || 'primary'"
            [disabled]="actionButton.disabled || false"
            [ariaLabel]="actionButton.label"
            (clicked)="actionButton.onClick()">
            {{ actionButton.label }}
          </app-glass-button>
        </div>
      </div>
    </app-glass-card>
  `,
  styles: []
})
export class FilterSectionComponent {
  /**
   * Filter fields configuration
   */
  @Input() fields!: FilterField[];

  /**
   * Action button configuration
   */
  @Input() actionButton?: FilterActionButton;

  /**
   * Number of columns in grid layout
   */
  @Input() columns: number = 3;

  /**
   * Loading state
   */
  @Input() loading?: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Filter change event
   */
  @Output() filterChange = new EventEmitter<{ key: string; value: unknown }>();

  /**
   * Search event (emitted on Enter key)
   */
  @Output() search = new EventEmitter<string>();

  /**
   * Get grid CSS classes based on columns
   */
  get gridClasses(): string {
    const cols: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-5'
    };
    return `grid ${cols[this.columns] || 'grid-cols-1 md:grid-cols-3'} gap-4`;
  }

  /**
   * Get field ID for accessibility
   */
  getFieldId(key: string): string {
    return `filter-field-${key}`;
  }

  /**
   * Get field error ID for accessibility
   */
  getFieldErrorId(key: string): string {
    return `filter-field-error-${key}`;
  }

  /**
   * Handle field value change
   */
  onFieldChange(key: string, value: unknown): void {
    this.filterChange.emit({ key, value });
  }

  /**
   * Get field value as string
   */
  getFieldValueAsString(field: FilterField): string {
    if (!field.value) return '';
    if (typeof field.value === 'string') return field.value;
    return String(field.value);
  }

  /**
   * Handle search (Enter key)
   */
  onSearch(searchTerm: string): void {
    this.search.emit(searchTerm);
  }

  /**
   * TrackBy function for fields
   */
  trackByField(index: number, field: FilterField): string {
    return field.key || index.toString();
  }

  /**
   * TrackBy function for options
   */
  trackByOption(index: number, option: { value: string; label: string }): string {
    return option.value || index.toString();
  }
}


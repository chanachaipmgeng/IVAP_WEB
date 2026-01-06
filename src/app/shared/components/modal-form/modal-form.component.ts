/**
 * Modal Form Component
 *
 * Modal component with integrated form fields. Provides a reusable modal form pattern
 * with form field management, validation, and submission handling.
 *
 * @example
 * ```html
 * <app-modal-form
 *   [isOpen]="showModal"
 *   [title]="'Add User'"
 *   [fields]="formFields"
 *   [loading]="saving"
 *   (closed)="closeModal()"
 *   (submitted)="onSubmit($event)">
 * </app-modal-form>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { FormFieldComponent, FormFieldConfig } from '../form-field/form-field.component';
import { GlassButtonComponent } from '../glass-button/glass-button.component';

@Component({
  selector: 'app-modal-form',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormFieldComponent, GlassButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="title"
      [loading]="loading"
      [closable]="closable"
      [ariaLabel]="ariaLabel || title || 'Form modal'"
      (closed)="onClose()">

      <!-- Form Content -->
      <div class="space-y-6" role="form" [attr.aria-label]="title || 'Form'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-form-field
            *ngFor="let field of fields; trackBy: trackByField"
            [config]="field"
            [colSpan]="field.fullWidth ? 'md:col-span-2' : 'md:col-span-1'"
            (valueChange)="onFieldChange($event)"
          />
        </div>
      </div>

      <!-- Footer with buttons -->
      <div slot="footer" class="flex justify-end gap-3" role="group" [attr.aria-label]="'Form actions'">
        <app-glass-button
          variant="secondary"
          [ariaLabel]="cancelLabel"
          (clicked)="onClose()">
          {{ cancelLabel }}
        </app-glass-button>
        <app-glass-button
          variant="primary"
          [loading]="loading"
          [ariaLabel]="submitLabel"
          (clicked)="onSubmit()">
          {{ submitLabel }}
        </app-glass-button>
      </div>
    </app-modal>
  `,
  styles: []
})
export class ModalFormComponent {
  /**
   * Modal open state
   */
  @Input() isOpen: boolean = false;

  /**
   * Modal title
   */
  @Input() title: string = '';

  /**
   * Form fields configuration
   */
  @Input() fields!: FormFieldConfig[];

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Whether modal can be closed
   */
  @Input() closable: boolean = true;

  /**
   * Submit button label
   */
  @Input() submitLabel: string = 'Save';

  /**
   * Cancel button label
   */
  @Input() cancelLabel: string = 'Cancel';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the modal
   */
  @Input() ariaLabel?: string;

  /**
   * Modal closed event
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Form submitted event
   */
  @Output() submitted = new EventEmitter<Record<string, unknown>>();

  /**
   * Field change event
   */
  @Output() fieldChange = new EventEmitter<{ key: string; value: unknown }>();

  /**
   * Handle modal close
   */
  onClose(): void {
    this.closed.emit();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    const formData: Record<string, unknown> = {};
    this.fields.forEach(field => {
      formData[field.key] = field.value;
    });
    this.submitted.emit(formData);
  }

  /**
   * Handle field value change
   */
  onFieldChange(event: { key: string; value: unknown }): void {
    const field = this.fields.find(f => f.key === event.key);
    if (field) {
      // Type-safe assignment: FormFieldConfig.value accepts string | number | boolean | null | undefined
      const value = event.value as string | number | boolean | null | undefined;
      field.value = value;
      // Emit field change event for parent component to handle validation
      this.fieldChange.emit(event);
    }
  }

  /**
   * TrackBy function for form fields
   */
  trackByField(index: number, field: FormFieldConfig): string {
    return field.key || index.toString();
  }
}


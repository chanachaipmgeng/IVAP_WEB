/**
 * Validation Demo Component
 *
 * Demo component showcasing form validation with various validators and error handling.
 * Demonstrates input validation, custom validators, and validation feedback.
 *
 * @example
 * ```html
 * <app-validation-demo></app-validation-demo>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ValidationService, FieldValidationConfig } from '../../../core/services/validation.service';
import { CustomValidators } from '../../../shared/validators/custom.validators';
import { I18nService } from '../../../core/services/i18n.service';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

/**
 * Validation demo interface
 */
interface ValidationDemo {
  name: string;
  description: string;
  form: FormGroup;
  fieldConfigs: FieldValidationConfig[];
  examples: any[];
}

@Component({
  selector: 'app-validation-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    NgOptimizedImage,
    ImageOptimizationDirective
  ],
  templateUrl: './validation-demo.component.html',
  styleUrl: './validation-demo.component.scss'
})
export class ValidationDemoComponent implements OnInit {
  // Demo forms
  basicForm: FormGroup;
  advancedForm: FormGroup;
  fileForm: FormGroup;
  dateForm: FormGroup;
  passwordForm: FormGroup;

  // Field configurations
  basicFieldConfigs: FieldValidationConfig[] = [];
  advancedFieldConfigs: FieldValidationConfig[] = [];
  fileFieldConfigs: FieldValidationConfig[] = [];
  dateFieldConfigs: FieldValidationConfig[] = [];
  passwordFieldConfigs: FieldValidationConfig[] = [];

  // Demo data
  validationDemos = signal<ValidationDemo[]>([]);
  selectedDemo = signal<ValidationDemo | null>(null);
  formErrors = signal<{ [key: string]: string[] }>({});
  validationSummary = signal<any>(null);

  // File upload
  selectedFile = signal<File | null>(null);
  filePreview = signal<string | null>(null);

  /**
   * Check if image URL is Base64 encoded
   */
  isBase64Image(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('data:image/') || url.startsWith('data:image/svg+xml');
  }

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private i18n: I18nService
  ) {
    this.basicForm = this.createBasicForm();
    this.advancedForm = this.createAdvancedForm();
    this.fileForm = this.createFileForm();
    this.dateForm = this.createDateForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.initializeFieldConfigs();
    this.initializeValidationDemos();
    this.selectedDemo.set(this.validationDemos()[0]);
  }

  private createBasicForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, CustomValidators.email]],
      username: ['', [Validators.required, CustomValidators.username]],
      phoneNumber: ['', [Validators.required, CustomValidators.phoneNumber]],
      website: ['', [CustomValidators.url]]
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.fb.group({
      thaiId: ['', [Validators.required, CustomValidators.thaiId]],
      creditCard: ['', [Validators.required, CustomValidators.creditCard]],
      ipAddress: ['', [CustomValidators.ipAddress]],
      macAddress: ['', [CustomValidators.macAddress]],
      age: ['', [Validators.required, CustomValidators.minAge(18)]]
    }, { validators: [] });
  }

  private createFileForm(): FormGroup {
    return this.fb.group({
      profileImage: [null, [
        CustomValidators.fileSize(5), // 5MB max
        CustomValidators.fileType(['image/'])
      ]],
      document: [null, [
        CustomValidators.fileSize(10), // 10MB max
        CustomValidators.fileType(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
      ]]
    });
  }

  private createDateForm(): FormGroup {
    return this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    }, { validators: [CustomValidators.dateRange('startDate', 'endDate')] });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      password: ['', [Validators.required, CustomValidators.strongPassword]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: [CustomValidators.passwordMatch('password', 'confirmPassword')] });
  }

  private initializeFieldConfigs(): void {
    this.basicFieldConfigs = [
      this.validationService.createFieldConfig('email', ['required', 'email']),
      this.validationService.createFieldConfig('username', ['required', 'username']),
      this.validationService.createFieldConfig('phoneNumber', ['required', 'phoneNumber']),
      this.validationService.createFieldConfig('website', ['url'])
    ];

    this.advancedFieldConfigs = [
      this.validationService.createFieldConfig('thaiId', ['required', 'thaiId']),
      this.validationService.createFieldConfig('creditCard', ['required', 'creditCard']),
      this.validationService.createFieldConfig('ipAddress', ['ipAddress']),
      this.validationService.createFieldConfig('macAddress', ['macAddress']),
      this.validationService.createFieldConfig('age', ['required', 'minAge'])
    ];

    this.fileFieldConfigs = [
      this.validationService.createFieldConfig('profileImage', ['fileSize', 'fileType']),
      this.validationService.createFieldConfig('document', ['fileSize', 'fileType'])
    ];

    this.dateFieldConfigs = [
      this.validationService.createFieldConfig('startDate', ['required']),
      this.validationService.createFieldConfig('endDate', ['required'])
    ];

    this.passwordFieldConfigs = [
      this.validationService.createFieldConfig('password', ['required', 'strongPassword']),
      this.validationService.createFieldConfig('confirmPassword', ['required'])
    ];
  }

  private initializeValidationDemos(): void {
    this.validationDemos.set([
      {
        name: 'Basic Validation',
        description: 'Common form validations like email, username, phone number',
        form: this.basicForm,
        fieldConfigs: this.basicFieldConfigs,
        examples: [
          { field: 'email', value: 'john@example.com', valid: true },
          { field: 'email', value: 'invalid-email', valid: false },
          { field: 'username', value: 'john_doe123', valid: true },
          { field: 'username', value: 'ab', valid: false },
          { field: 'phoneNumber', value: '0812345678', valid: true },
          { field: 'phoneNumber', value: '123', valid: false }
        ]
      },
      {
        name: 'Advanced Validation',
        description: 'Complex validations like Thai ID, credit card, IP address',
        form: this.advancedForm,
        fieldConfigs: this.advancedFieldConfigs,
        examples: [
          { field: 'thaiId', value: '1234567890123', valid: true },
          { field: 'thaiId', value: '1234567890124', valid: false },
          { field: 'creditCard', value: '4111111111111111', valid: true },
          { field: 'creditCard', value: '1234567890123456', valid: false },
          { field: 'ipAddress', value: '192.168.1.1', valid: true },
          { field: 'ipAddress', value: '999.999.999.999', valid: false }
        ]
      },
      {
        name: 'File Validation',
        description: 'File upload validations for size and type',
        form: this.fileForm,
        fieldConfigs: this.fileFieldConfigs,
        examples: [
          { field: 'profileImage', type: 'image/jpeg', size: '2MB', valid: true },
          { field: 'profileImage', type: 'text/plain', size: '1MB', valid: false },
          { field: 'document', type: 'application/pdf', size: '5MB', valid: true },
          { field: 'document', type: 'image/jpeg', size: '3MB', valid: false }
        ]
      },
      {
        name: 'Date Validation',
        description: 'Date range and age validations',
        form: this.dateForm,
        fieldConfigs: this.dateFieldConfigs,
        examples: [
          { field: 'startDate', value: '2024-01-01', endDate: '2024-12-31', valid: true },
          { field: 'startDate', value: '2024-12-31', endDate: '2024-01-01', valid: false }
        ]
      },
      {
        name: 'Password Validation',
        description: 'Strong password and confirmation validations',
        form: this.passwordForm,
        fieldConfigs: this.passwordFieldConfigs,
        examples: [
          { field: 'password', value: 'MyStr0ng!Pass', confirmPassword: 'MyStr0ng!Pass', valid: true },
          { field: 'password', value: 'weak', confirmPassword: 'weak', valid: false },
          { field: 'password', value: 'MyStr0ng!Pass', confirmPassword: 'DifferentPass', valid: false }
        ]
      }
    ]);
  }

  selectDemo(demo: ValidationDemo): void {
    this.selectedDemo.set(demo);
    this.updateFormErrors();
  }

  updateFormErrors(): void {
    const demo = this.selectedDemo();
    if (demo) {
      const errors = this.validationService.getFormErrors(demo.form, demo.fieldConfigs);
      this.formErrors.set(errors);

      const summary = this.validationService.getValidationSummary(demo.form, demo.fieldConfigs);
      this.validationSummary.set(summary);
    }
  }

  onFieldChange(fieldName: string): void {
    const demo = this.selectedDemo();
    if (demo) {
      const control = demo.form.get(fieldName);
      if (control) {
        control.markAsTouched();
        this.updateFormErrors();
      }
    }
  }

  onFileSelect(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      const demo = this.selectedDemo();
      if (demo) {
        const control = demo.form.get(fieldName);
        if (control) {
          control.setValue(file);
          control.markAsTouched();
          this.updateFormErrors();
        }
      }

      if (fieldName === 'profileImage') {
        this.selectedFile.set(file);
        this.createFilePreview(file);
      }
    }
  }

  private createFilePreview(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  getFieldError(fieldName: string): string {
    const demo = this.selectedDemo();
    if (!demo) return '';

    const control = demo.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const fieldConfig = demo.fieldConfigs.find(fc => fc.fieldName === fieldName);
    return this.validationService.getErrorMessage(control, fieldName, fieldConfig?.customMessages);
  }

  getFieldStatus(fieldName: string): any {
    const demo = this.selectedDemo();
    if (!demo) return null;

    const control = demo.form.get(fieldName);
    if (!control) return null;

    return this.validationService.getFieldStatus(control);
  }

  isFieldInvalid(fieldName: string): boolean {
    const status = this.getFieldStatus(fieldName);
    return status ? status.isInvalid : false;
  }

  isFieldValid(fieldName: string): boolean {
    const status = this.getFieldStatus(fieldName);
    return status ? status.isValid : false;
  }

  onSubmit(): void {
    const demo = this.selectedDemo();
    if (!demo) return;

    if (demo.form.valid) {
      alert('Form is valid! Data: ' + JSON.stringify(demo.form.value, null, 2));
    } else {
      alert('Form has validation errors. Please check the fields.');
      this.updateFormErrors();
    }
  }

  resetForm(): void {
    const demo = this.selectedDemo();
    if (demo) {
      demo.form.reset();
      this.updateFormErrors();
    }
  }

  fillExampleData(example: any): void {
    const demo = this.selectedDemo();
    if (!demo) return;

    if (example.field) {
      const control = demo.form.get(example.field);
      if (control) {
        control.setValue(example.value);
        control.markAsTouched();
      }
    }

    if (example.endDate) {
      const endControl = demo.form.get('endDate');
      if (endControl) {
        endControl.setValue(example.endDate);
        endControl.markAsTouched();
      }
    }

    if (example.confirmPassword) {
      const confirmControl = demo.form.get('confirmPassword');
      if (confirmControl) {
        confirmControl.setValue(example.confirmPassword);
        confirmControl.markAsTouched();
      }
    }

    this.updateFormErrors();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

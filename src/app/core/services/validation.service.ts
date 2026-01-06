import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface FieldValidationConfig {
  fieldName: string;
  validators: string[];
  customMessages?: { [key: string]: string };
}

export interface FieldStatus {
  isValid: boolean;
  isInvalid: boolean;
  isPending: boolean;
  isTouched: boolean;
  isDirty: boolean;
}

export interface ErrorMessage {
  field: string;
  message: string;
  type: string;
}

export interface ValidationSummary {
  isValid: boolean;
  totalErrors: number;
  errors: ErrorMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  /**
   * Email validator
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values (use required validator)
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(control.value) ? null : { email: { value: control.value } };
    };
  }

  /**
   * Phone number validator (Thai format)
   */
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const phoneRegex = /^(\+66|0)[0-9]{9}$/;
      return phoneRegex.test(control.value.replace(/\s/g, '')) ? null : { phone: { value: control.value } };
    };
  }

  /**
   * Thai ID validator
   */
  thaiIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const id = control.value.replace(/-/g, '');
      if (id.length !== 13) {
        return { thaiId: { value: control.value } };
      }
      // Thai ID validation algorithm
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(id[i]) * (13 - i);
      }
      const checkDigit = (11 - (sum % 11)) % 10;
      return checkDigit === parseInt(id[12]) ? null : { thaiId: { value: control.value } };
    };
  }

  /**
   * License plate validator (Thai format)
   */
  licensePlateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const plateRegex = /^[ก-ฮ]{1,2}\s?[0-9]{1,4}\s?[ก-ฮ]{0,2}$/;
      return plateRegex.test(control.value) ? null : { licensePlate: { value: control.value } };
    };
  }

  /**
   * Card number validator
   */
  cardNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const cardRegex = /^[A-Z0-9]{8,16}$/;
      return cardRegex.test(control.value) ? null : { cardNumber: { value: control.value } };
    };
  }

  /**
   * UUID validator
   */
  uuidValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(control.value) ? null : { uuid: { value: control.value } };
    };
  }

  /**
   * Base64 validator
   */
  base64Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(control.value) ? null : { base64: { value: control.value } };
    };
  }

  /**
   * Date range validator
   */
  dateRangeValidator(startDateControl: AbstractControl, endDateControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!startDateControl.value || !endDateControl.value) {
        return null;
      }
      const startDate = new Date(startDateControl.value);
      const endDate = new Date(endDateControl.value);
      return startDate <= endDate ? null : { dateRange: { value: control.value } };
    };
  }

  /**
   * Get validation error message
   */
  getValidationErrorMessage(control: AbstractControl, fieldName: string = 'Field'): string {
    if (!control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${fieldName} is required`;
    }
    if (control.errors['email']) {
      return `${fieldName} must be a valid email address`;
    }
    if (control.errors['phone'] || control.errors['phoneNumber']) {
      return `${fieldName} must be a valid phone number`;
    }
    if (control.errors['thaiId']) {
      return `${fieldName} must be a valid Thai ID`;
    }
    if (control.errors['licensePlate']) {
      return `${fieldName} must be a valid license plate`;
    }
    if (control.errors['cardNumber'] || control.errors['creditCard']) {
      return `${fieldName} must be a valid card number`;
    }
    if (control.errors['uuid']) {
      return `${fieldName} must be a valid UUID`;
    }
    if (control.errors['base64']) {
      return `${fieldName} must be a valid Base64 string`;
    }
    if (control.errors['dateRange']) {
      return `End date must be after start date`;
    }
    if (control.errors['username']) {
      return `${fieldName} must be 3-20 characters, alphanumeric and underscore only`;
    }
    if (control.errors['url']) {
      return `${fieldName} must be a valid URL`;
    }
    if (control.errors['ipAddress']) {
      return `${fieldName} must be a valid IP address`;
    }
    if (control.errors['macAddress']) {
      return `${fieldName} must be a valid MAC address`;
    }
    if (control.errors['strongPassword']) {
      const passwordErrors = control.errors['strongPassword'];
      if (passwordErrors['minLength']) {
        return `${fieldName} must be at least 8 characters`;
      }
      if (passwordErrors['uppercase']) {
        return `${fieldName} must contain at least one uppercase letter`;
      }
      if (passwordErrors['lowercase']) {
        return `${fieldName} must contain at least one lowercase letter`;
      }
      if (passwordErrors['digit']) {
        return `${fieldName} must contain at least one digit`;
      }
      if (passwordErrors['specialChar']) {
        return `${fieldName} must contain at least one special character`;
      }
      return `${fieldName} does not meet password requirements`;
    }
    if (control.errors['passwordMatch']) {
      return `Passwords do not match`;
    }
    if (control.errors['fileSize']) {
      const fileSizeError = control.errors['fileSize'];
      return fileSizeError['message'] || `${fieldName} file size is too large`;
    }
    if (control.errors['fileType']) {
      const fileTypeError = control.errors['fileType'];
      return fileTypeError['message'] || `${fieldName} file type is not allowed`;
    }
    if (control.errors['minAge']) {
      const minAgeError = control.errors['minAge'];
      return minAgeError['message'] || `${fieldName} age requirement not met`;
    }
    if (control.errors['minlength']) {
      return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['maxlength']) {
      return `${fieldName} must be at most ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `${fieldName} must be at least ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `${fieldName} must be at most ${control.errors['max'].max}`;
    }
    if (control.errors['pattern']) {
      return `${fieldName} format is invalid`;
    }

    return `${fieldName} is invalid`;
  }

  /**
   * Create field validation config
   */
  createFieldConfig(fieldName: string, validators: string[], customMessages?: { [key: string]: string }): FieldValidationConfig {
    return {
      fieldName,
      validators,
      customMessages
    };
  }

  /**
   * Get form errors
   */
  getFormErrors(form: FormGroup, fieldConfigs: FieldValidationConfig[]): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};
    
    fieldConfigs.forEach(config => {
      const control = form.get(config.fieldName);
      if (control && control.errors && control.touched) {
        const fieldErrors: string[] = [];
        Object.keys(control.errors).forEach(errorKey => {
          const message = this.getErrorMessage(control, config.fieldName, config.customMessages);
          if (message) {
            fieldErrors.push(message);
          }
        });
        if (fieldErrors.length > 0) {
          errors[config.fieldName] = fieldErrors;
        }
      }
    });

    return errors;
  }

  /**
   * Get validation summary
   */
  getValidationSummary(form: FormGroup, fieldConfigs: FieldValidationConfig[]): ValidationSummary {
    const errors: ErrorMessage[] = [];
    
    fieldConfigs.forEach(config => {
      const control = form.get(config.fieldName);
      if (control && control.errors && control.touched) {
        Object.keys(control.errors).forEach(errorKey => {
          const message = this.getErrorMessage(control, config.fieldName, config.customMessages);
          if (message) {
            errors.push({
              field: config.fieldName,
              message,
              type: errorKey
            });
          }
        });
      }
    });

    return {
      isValid: form.valid,
      totalErrors: errors.length,
      errors
    };
  }

  /**
   * Get error message (with custom messages support)
   */
  getErrorMessage(control: AbstractControl, fieldName: string, customMessages?: { [key: string]: string }): string {
    if (!control.errors || !control.touched) {
      return '';
    }

    // Check for custom messages first
    if (customMessages) {
      const errorKeys = Object.keys(control.errors);
      for (const errorKey of errorKeys) {
        if (customMessages[errorKey]) {
          return customMessages[errorKey];
        }
      }
    }

    // Use default messages
    return this.getValidationErrorMessage(control, fieldName);
  }

  /**
   * Get field status
   */
  getFieldStatus(control: AbstractControl): FieldStatus {
    return {
      isValid: control.valid && control.touched,
      isInvalid: control.invalid && control.touched,
      isPending: control.pending,
      isTouched: control.touched,
      isDirty: control.dirty
    };
  }
}

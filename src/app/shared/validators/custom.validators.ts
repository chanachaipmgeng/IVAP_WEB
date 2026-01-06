import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {

  // Email validation with custom patterns
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);

    return isValid ? null : { email: { value: control.value, message: 'Invalid email format' } };
  }

  // Strong password validation
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const password = control.value;
    const errors: any = {};

    if (password.length < 8) {
      errors.minLength = { required: 8, actual: password.length };
    }

    if (!/[A-Z]/.test(password)) {
      errors.uppercase = { message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
      errors.lowercase = { message: 'Password must contain at least one lowercase letter' };
    }

    if (!/\d/.test(password)) {
      errors.digit = { message: 'Password must contain at least one digit' };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.specialChar = { message: 'Password must contain at least one special character' };
    }

    return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
  }

  // Phone number validation (Thai format)
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const phonePattern = /^(\+66|0)[0-9]{8,9}$/;
    const isValid = phonePattern.test(control.value.replace(/\s/g, ''));

    return isValid ? null : { phoneNumber: { value: control.value, message: 'Invalid phone number format' } };
  }

  // Thai ID validation
  static thaiId(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const id = control.value.replace(/-/g, '');
    if (id.length !== 13) {
      return { thaiId: { message: 'Thai ID must be 13 digits' } };
    }

    // Thai ID check digit algorithm
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id[i]) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;

    if (parseInt(id[12]) !== checkDigit) {
      return { thaiId: { message: 'Invalid Thai ID check digit' } };
    }

    return null;
  }

  // Credit card validation (Luhn algorithm)
  static creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const cardNumber = control.value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
      return { creditCard: { message: 'Invalid credit card format' } };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0 ? null : { creditCard: { message: 'Invalid credit card number' } };
  }

  // URL validation
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: { value: control.value, message: 'Invalid URL format' } };
    }
  }

  // Date range validation
  static dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const startDate = formGroup.get(startDateField)?.value;
      const endDate = formGroup.get(endDateField)?.value;

      if (!startDate || !endDate) return null;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return {
          dateRange: {
            message: 'End date must be after start date',
            startDate,
            endDate
          }
        };
      }

      return null;
    };
  }

  // Password confirmation validation
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const password = formGroup.get(passwordField)?.value;
      const confirmPassword = formGroup.get(confirmPasswordField)?.value;

      if (!password || !confirmPassword) return null;

      if (password !== confirmPassword) {
        return {
          passwordMatch: {
            message: 'Passwords do not match',
            passwordField,
            confirmPasswordField
          }
        };
      }

      return null;
    };
  }

  // File size validation
  static fileSize(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value;
      if (file instanceof File) {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
          return {
            fileSize: {
              message: `File size must be less than ${maxSizeInMB}MB`,
              maxSize: maxSizeInMB,
              actualSize: (file.size / (1024 * 1024)).toFixed(2)
            }
          };
        }
      }

      return null;
    };
  }

  // File type validation
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value;
      if (file instanceof File) {
        const fileType = file.type;
        const isValidType = allowedTypes.some(type => fileType.startsWith(type));

        if (!isValidType) {
          return {
            fileType: {
              message: `File type must be one of: ${allowedTypes.join(', ')}`,
              allowedTypes,
              actualType: fileType
            }
          };
        }
      }

      return null;
    };
  }

  // Age validation
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

      if (actualAge < minAge) {
        return {
          minAge: {
            message: `Age must be at least ${minAge} years`,
            required: minAge,
            actual: actualAge
          }
        };
      }

      return null;
    };
  }

  // Username validation (alphanumeric + underscore)
  static username(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    const isValid = usernamePattern.test(control.value);

    return isValid ? null : {
      username: {
        value: control.value,
        message: 'Username must be 3-20 characters, alphanumeric and underscore only'
      }
    };
  }

  // IP address validation
  static ipAddress(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const isValid = ipPattern.test(control.value);

    return isValid ? null : {
      ipAddress: {
        value: control.value,
        message: 'Invalid IP address format'
      }
    };
  }

  // MAC address validation
  static macAddress(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    const isValid = macPattern.test(control.value);

    return isValid ? null : {
      macAddress: {
        value: control.value,
        message: 'Invalid MAC address format'
      }
    };
  }

  // Custom regex validation
  static pattern(pattern: RegExp, errorMessage: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isValid = pattern.test(control.value);
      return isValid ? null : {
        pattern: {
          value: control.value,
          message: errorMessage,
          pattern: pattern.toString()
        }
      };
    };
  }

  // Conditional validation
  static conditional(condition: (control: AbstractControl) => boolean, validator: ValidatorFn): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!condition(control)) return null;
      return validator(control);
    };
  }

  // Async validation (for API calls)
  static asyncValidator(validatorFn: (value: any) => Promise<boolean>, errorMessage: string): ValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      if (!control.value) return Promise.resolve(null);

      return validatorFn(control.value).then(isValid => {
        return isValid ? null : {
          async: {
            value: control.value,
            message: errorMessage
          }
        };
      });
    };
  }
}



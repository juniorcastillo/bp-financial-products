import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    return value.length === 0 ? { blank: true } : null;
  };
}

export function validHttpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    if (!value) {
      return null;
    }

    try {
      const url = new URL(value);

      return url.protocol === 'http:' || url.protocol === 'https:'
        ? null
        : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  };
}
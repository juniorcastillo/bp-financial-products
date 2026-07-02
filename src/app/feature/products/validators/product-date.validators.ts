import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { addOneYear, toIsoDate } from '../../../shared/utils/date.utils';

export function releaseDateNotInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    const today = toIsoDate(new Date());

    return value < today ? { releaseDateInPast: true } : null;
  };
}

export function revisionDateMatchesReleaseValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const releaseDate = group.get('date_release')?.value as string;
    const revisionDate = group.get('date_revision')?.value as string;

    if (!releaseDate || !revisionDate) {
      return null;
    }

    return addOneYear(releaseDate) === revisionDate
      ? null
      : { invalidRevisionDate: true };
  };
}
import { FormControl, FormGroup } from '@angular/forms';

import {
  releaseDateNotInPastValidator,
  revisionDateMatchesReleaseValidator,
} from './product-date.validators';
import { addOneYear, toIsoDate } from '../../../shared/utils/date.utils';

describe('product-date.validators', () => {
  describe('releaseDateNotInPastValidator', () => {
    const validator = releaseDateNotInPastValidator();

    it('debe aceptar una fecha vacía para que Validators.required maneje ese caso', () => {
      const control = new FormControl('');

      expect(validator(control)).toBeNull();
    });

    it('debe rechazar una fecha anterior a hoy', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const control = new FormControl(toIsoDate(yesterday));

      expect(validator(control)).toEqual({
        releaseDateInPast: true,
      });
    });

    it('debe aceptar la fecha de hoy', () => {
      const control = new FormControl(toIsoDate(new Date()));

      expect(validator(control)).toBeNull();
    });

    it('debe aceptar una fecha futura', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const control = new FormControl(toIsoDate(tomorrow));

      expect(validator(control)).toBeNull();
    });
  });

  describe('revisionDateMatchesReleaseValidator', () => {
    const validator = revisionDateMatchesReleaseValidator();

    it('debe aceptar cuando falta una de las fechas', () => {
      const group = new FormGroup({
        date_release: new FormControl('2026-07-01'),
        date_revision: new FormControl(''),
      });

      expect(validator(group)).toBeNull();
    });

    it('debe aceptar una fecha de revisión exactamente un año después', () => {
      const releaseDate = '2026-07-01';

      const group = new FormGroup({
        date_release: new FormControl(releaseDate),
        date_revision: new FormControl(addOneYear(releaseDate)),
      });

      expect(validator(group)).toBeNull();
    });

    it('debe rechazar una fecha de revisión que no sea exactamente un año después', () => {
      const group = new FormGroup({
        date_release: new FormControl('2026-07-01'),
        date_revision: new FormControl('2027-07-02'),
      });

      expect(validator(group)).toEqual({
        invalidRevisionDate: true,
      });
    });

    it('debe validar correctamente años bisiestos mediante addOneYear', () => {
      const releaseDate = '2028-02-29';

      const group = new FormGroup({
        date_release: new FormControl(releaseDate),
        date_revision: new FormControl(addOneYear(releaseDate)),
      });

      expect(validator(group)).toBeNull();
    });
  });
});
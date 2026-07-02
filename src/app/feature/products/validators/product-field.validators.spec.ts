import { FormControl } from '@angular/forms';
import { notBlankValidator, validHttpUrlValidator } from './product-field.validators';

describe('product-field.validators', () => {
  describe('notBlankValidator', () => {
    const validator = notBlankValidator();

    it('debe aceptar valor con contenido', () => {
      const control = new FormControl('Tarjeta de Crédito');

      expect(validator(control)).toBeNull();
    });

    it('debe rechazar valor vacío', () => {
      const control = new FormControl('');

      expect(validator(control)).toEqual({ blank: true });
    });

    it('debe rechazar valor solo con espacios', () => {
      const control = new FormControl('   ');

      expect(validator(control)).toEqual({ blank: true });
    });

    it('debe rechazar valor null', () => {
      const control = new FormControl(null);

      expect(validator(control)).toEqual({ blank: true });
    });

    it('debe rechazar valor undefined', () => {
      const control = new FormControl(undefined);

      expect(validator(control)).toEqual({ blank: true });
    });

    it('debe trimear espacios antes de validar', () => {
      const control = new FormControl('  Contenido con espacios  ');

      expect(validator(control)).toBeNull();
    });

    it('debe ser case-insensitive', () => {
      const control = new FormControl('MINÚSCULAS');

      expect(validator(control)).toBeNull();
    });
  });

  describe('validHttpUrlValidator', () => {
    const validator = validHttpUrlValidator();

    it('debe aceptar URL HTTPS válida', () => {
      const control = new FormControl('https://www.example.com/logo.png');

      expect(validator(control)).toBeNull();
    });

    it('debe aceptar URL HTTP válida', () => {
      const control = new FormControl('http://www.example.com/logo.png');

      expect(validator(control)).toBeNull();
    });

    it('debe rechazar URL con protocolo diferente', () => {
      const control = new FormControl('ftp://example.com/logo.png');

      expect(validator(control)).toEqual({ invalidUrl: true });
    });

    it('debe rechazar javascript:', () => {
      const control = new FormControl('javascript:alert(1)');

      expect(validator(control)).toEqual({ invalidUrl: true });
    });

    it('debe rechazar data:text/html', () => {
      const control = new FormControl('data:text/html,<script>alert(1)</script>');

      expect(validator(control)).toEqual({ invalidUrl: true });
    });

    it('debe aceptar valor vacío (validador requerido lo maneja)', () => {
      const control = new FormControl('');

      expect(validator(control)).toBeNull();
    });

    it('debe aceptar valor null (validador requerido lo maneja)', () => {
      const control = new FormControl(null);

      expect(validator(control)).toBeNull();
    });

    it('debe rechazar string sin protocolo', () => {
      const control = new FormControl('www.example.com/logo.png');

      expect(validator(control)).toEqual({ invalidUrl: true });
    });

    it('debe trimear espacios antes de validar', () => {
      const control = new FormControl('  https://www.example.com/logo.png  ');

      expect(validator(control)).toBeNull();
    });

    it('debe rechazar URL malformada', () => {
      const control = new FormControl('https://');

      expect(validator(control)).toEqual({ invalidUrl: true });
    });

    it('debe aceptar URL con query parameters', () => {
      const control = new FormControl(
        'https://example.com/logo.png?size=large&format=png',
      );

      expect(validator(control)).toBeNull();
    });

    it('debe aceptar URL con fragmento', () => {
      const control = new FormControl('https://example.com/logo.png#section');

      expect(validator(control)).toBeNull();
    });

    it('debe aceptar URL con puerto', () => {
      const control = new FormControl('https://example.com:8443/logo.png');

      expect(validator(control)).toBeNull();
    });

    it('debe ser case-insensitive para protocolo', () => {
      const control = new FormControl('HTTPS://example.com/logo.png');

      expect(validator(control)).toBeNull();
    });
  });
});

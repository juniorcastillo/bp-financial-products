import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('Renderizado del header', () => {
    it('debe renderizar header con clase app-header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.app-header');

      expect(header).toBeTruthy();
    });

    it('debe tener contenedor de marca (brand)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const brand = compiled.querySelector('.app-header__brand');

      expect(brand).toBeTruthy();
    });

    it('debe renderizar SVG icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');

      expect(svg).toBeTruthy();
    });

    it('debe mostrar texto BANCO', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('header');

      expect(header?.textContent).toContain('BANCO');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener aria-label en contenedor de marca', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const brand = compiled.querySelector('.app-header__brand');

      expect(brand?.getAttribute('aria-label')).toBe('Banco');
    });

    it('debe tener aria-hidden en SVG icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');

      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('debe tener semantic header tag', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('header');

      expect(header).toBeTruthy();
      expect(header?.tagName.toLowerCase()).toBe('header');
    });
  });

  describe('Estructura SVG', () => {
    it('debe contener paths en SVG', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const paths = compiled.querySelectorAll('path');

      expect(paths.length).toBeGreaterThan(0);
    });

    it('debe contener circle en SVG', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const circle = compiled.querySelector('circle');

      expect(circle).toBeTruthy();
    });

    it('debe tener viewBox en SVG', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');

      expect(svg?.getAttribute('viewBox')).toBeTruthy();
    });
  });

  describe('Estilos', () => {
    it('debe aplicar clases CSS correctamente', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.app-header');
      const brand = compiled.querySelector('.app-header__brand');
      const icon = compiled.querySelector('.app-header__icon');

      expect(header?.classList.contains('app-header')).toBe(true);
      expect(brand?.classList.contains('app-header__brand')).toBe(true);
      expect(icon?.classList.contains('app-header__icon')).toBe(true);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NotificationService } from '../../../core/services/notification.service';
import { AppToastComponent } from './app-toast.component';

describe('AppToastComponent', () => {
  let component: AppToastComponent;
  let fixture: ComponentFixture<AppToastComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [AppToastComponent],
      providers: [NotificationService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppToastComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('Renderizado de notificaciones', () => {
    it('no debe renderizar el toast si no hay notificación', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.toast')).toBeNull();
    });

    it('debe renderizar una notificación de éxito', () => {
      notificationService.success('Producto creado.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast--success');

      expect(toast).toBeTruthy();
      expect(toast?.textContent).toContain('Producto creado.');
    });

    it('debe renderizar una notificación de error', () => {
      notificationService.error('Error al guardar.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast--error');

      expect(toast).toBeTruthy();
      expect(toast?.textContent).toContain('Error al guardar.');
    });

    it('debe renderizar una notificación informativa', () => {
      notificationService.info('Información relevante.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast--info');

      expect(toast).toBeTruthy();
      expect(toast?.textContent).toContain('Información relevante.');
    });
  });

  describe('Cierre de notificaciones', () => {
    it('debe cerrar la notificación al ejecutar close()', () => {
      notificationService.success('Producto creado.');
      fixture.detectChanges();

      component.close();
      fixture.detectChanges();

      expect(notificationService.notification()).toBeNull();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.toast')).toBeNull();
    });

    it('debe cerrar la notificación al hacer clic en el botón', () => {
      notificationService.success('Producto creado.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const closeButton = compiled.querySelector(
        '.toast__close',
      ) as HTMLButtonElement;

      closeButton.click();
      fixture.detectChanges();

      expect(notificationService.notification()).toBeNull();
      expect(compiled.querySelector('.toast')).toBeNull();
    });

    it('debe tener aria-label en el botón de cierre', () => {
      notificationService.success('Producto creado.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const closeButton = compiled.querySelector('.toast__close');

      expect(closeButton?.getAttribute('aria-label')).toBe(
        'Cerrar notificación',
      );
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener aria-live polite en el contenedor', () => {
      notificationService.success('Mensaje.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('[aria-live]');

      expect(container?.getAttribute('aria-live')).toBe('polite');
    });

    it('debe tener aria-atomic true en el contenedor', () => {
      notificationService.success('Mensaje.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('[aria-atomic]');

      expect(container?.getAttribute('aria-atomic')).toBe('true');
    });

    it('debe tener role status en el toast', () => {
      notificationService.success('Mensaje.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('[role="status"]');

      expect(toast).toBeTruthy();
    });

    it('debe ocultar el icono a lectores de pantalla', () => {
      notificationService.success('Mensaje.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const icon = compiled.querySelector('[aria-hidden="true"]');

      expect(icon).toBeTruthy();
    });
  });

  describe('Clases según el tipo', () => {
    it('debe aplicar clase de éxito', () => {
      notificationService.success('Éxito.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast');

      expect(toast?.classList.contains('toast--success')).toBe(true);
    });

    it('debe aplicar clase de error', () => {
      notificationService.error('Error.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast');

      expect(toast?.classList.contains('toast--error')).toBe(true);
    });

    it('debe aplicar clase informativa', () => {
      notificationService.info('Info.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast');

      expect(toast?.classList.contains('toast--info')).toBe(true);
    });
  });

  describe('Cola de notificaciones', () => {
    it('debe mostrar la primera notificación mientras está activa', () => {
      notificationService.success('Primera.');
      notificationService.error('Segunda.');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast');

      expect(toast?.textContent).toContain('Primera.');
    });

    it('debe mostrar la segunda notificación cuando expira la primera', () => {
      notificationService.success('Primera.');
      notificationService.error('Segunda.');
      fixture.detectChanges();

      vi.advanceTimersByTime(4500);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const toast = compiled.querySelector('.toast');

      expect(toast?.textContent).toContain('Segunda.');
      expect(toast?.classList.contains('toast--error')).toBe(true);
    });

    it('debe ocultar el toast cuando expira la única notificación', () => {
      notificationService.success('Única.');
      fixture.detectChanges();

      vi.advanceTimersByTime(4500);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(notificationService.notification()).toBeNull();
      expect(compiled.querySelector('.toast')).toBeNull();
    });
  });
});
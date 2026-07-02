import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [NotificationService],
    });

    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    service.close();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('Notificaciones de éxito', () => {
    it('debe crear una notificación de éxito', () => {
      service.success('Producto creado.');

      expect(service.notification()).toMatchObject({
        type: 'success',
        message: 'Producto creado.',
      });
    });

    it('debe cerrar una notificación de éxito después de 4500ms', () => {
      service.success('Producto creado.');

      vi.advanceTimersByTime(4499);
      expect(service.notification()).not.toBeNull();

      vi.advanceTimersByTime(1);
      expect(service.notification()).toBeNull();
    });
  });

  describe('Notificaciones de error', () => {
    it('debe crear una notificación de error', () => {
      service.error('No fue posible guardar el producto.');

      expect(service.notification()).toMatchObject({
        type: 'error',
        message: 'No fue posible guardar el producto.',
      });
    });

    it('debe cerrar una notificación de error después de 6000ms', () => {
      service.error('Error.');

      vi.advanceTimersByTime(5999);
      expect(service.notification()).not.toBeNull();

      vi.advanceTimersByTime(1);
      expect(service.notification()).toBeNull();
    });
  });

  describe('Notificaciones informativas', () => {
    it('debe crear una notificación informativa', () => {
      service.info('Información relevante.');

      expect(service.notification()).toMatchObject({
        type: 'info',
        message: 'Información relevante.',
      });
    });

    it('debe cerrar una notificación informativa después de 4500ms', () => {
      service.info('Información relevante.');

      vi.advanceTimersByTime(4500);

      expect(service.notification()).toBeNull();
    });
  });

  describe('Cierre manual', () => {
    it('debe cerrar la notificación actual', () => {
      service.success('Mensaje.');

      expect(service.notification()).not.toBeNull();

      service.close();

      expect(service.notification()).toBeNull();
    });

    it('no debe fallar al cerrar sin una notificación activa', () => {
      expect(() => service.close()).not.toThrow();
    });

    it('debe cancelar el temporizador al cerrar manualmente', () => {
      service.success('Mensaje.');

      service.close();
      vi.advanceTimersByTime(5000);

      expect(service.notification()).toBeNull();
    });
  });

  describe('Cola de notificaciones', () => {
    it('debe mostrar la primera notificación agregada', () => {
      service.success('Primera.');
      service.error('Segunda.');
      service.info('Tercera.');

      expect(service.notification()?.message).toBe('Primera.');
    });

    it('debe mantener el orden FIFO', () => {
      service.success('Primera.');
      service.error('Segunda.');
      service.info('Tercera.');

      vi.advanceTimersByTime(4500);
      expect(service.notification()?.message).toBe('Segunda.');

      vi.advanceTimersByTime(6000);
      expect(service.notification()?.message).toBe('Tercera.');

      vi.advanceTimersByTime(4500);
      expect(service.notification()).toBeNull();
    });

    it('debe mostrar la siguiente notificación al cerrar la actual', () => {
      service.success('Primera.');
      service.info('Segunda.');

      service.close();

      expect(service.notification()?.message).toBe('Segunda.');
    });

    it('debe incrementar el identificador de cada notificación', () => {
      service.success('Primera.');
      const firstId = service.notification()?.id;

      service.info('Segunda.');
      service.close();

      const secondId = service.notification()?.id;

      expect(secondId).toBeGreaterThan(firstId ?? 0);
    });
  });

  describe('Normalización de mensajes', () => {
    it('debe ignorar mensajes vacíos', () => {
      service.success('');

      expect(service.notification()).toBeNull();
    });

    it('debe ignorar mensajes con solo espacios', () => {
      service.success('   ');

      expect(service.notification()).toBeNull();
    });

    it('debe ignorar valores null', () => {
      service.success(null as unknown as string);

      expect(service.notification()).toBeNull();
    });

    it('debe eliminar espacios al inicio y al final', () => {
      service.success('  Producto creado correctamente.  ');

      expect(service.notification()?.message).toBe(
        'Producto creado correctamente.',
      );
    });
  });
});
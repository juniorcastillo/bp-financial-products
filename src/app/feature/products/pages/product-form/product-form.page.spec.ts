import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';

import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductApiService } from '../../../../core/services/financial-product-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductFormPage } from './product-form.page';

describe('ProductFormPage', () => {
  let component: ProductFormPage;
  let fixture: ComponentFixture<ProductFormPage>;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;

  const navigateByUrlMock = vi.fn();
  const routeParamGetMock = vi.fn<() => string | null>(() => null);

  const mockProduct: FinancialProduct = {
    id: 'tarjeta-credito',
    name: 'Tarjeta de Crédito Premium',
    description: 'Tarjeta de crédito con beneficios exclusivos.',
    logo: 'https://www.visa.com.ec/dam/logo.png',
    date_release: '2026-08-01',
    date_revision: '2027-08-01',
  };

  beforeEach(async () => {
    navigateByUrlMock.mockReset();
    routeParamGetMock.mockReset();
    routeParamGetMock.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [ProductFormPage, HttpClientTestingModule],
      providers: [
        FinancialProductApiService,
        NotificationService,
        {
          provide: Router,
          useValue: {
            navigateByUrl: navigateByUrlMock,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: routeParamGetMock,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    notificationService.close();
    httpMock.verify();
  });

  function fillValidCreateForm(): void {
    component.productForm.patchValue({
      id: 'nuevo-producto',
      name: 'Nuevo Producto',
      description: 'Descripción válida para el nuevo producto.',
      logo: 'https://www.visa.com.ec/logo.png',
      date_release: '2026-08-01',
    });

    component.onReleaseDateChange();
  }

  function prepareEditMode(): void {
    component.editingProductId.set(mockProduct.id);

    component.productForm.patchValue({
      id: mockProduct.id,
      name: mockProduct.name,
      description: mockProduct.description,
      logo: mockProduct.logo,
      date_release: mockProduct.date_release,
      date_revision: mockProduct.date_revision,
    });

    component.idControl.disable();
    component.revisionDateControl.disable();
  }

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('Modo creación y edición', () => {
    it('debe iniciar en modo creación cuando no hay ID en la ruta', () => {
      component.ngOnInit();

      expect(component.isEditMode()).toBe(false);
      expect(component.pageTitle()).toBe('Formulario de Registro');
      expect(component.submitLabel()).toBe('Enviar');
    });

    it('debe cargar producto y activar modo edición cuando hay ID en la ruta', () => {
      routeParamGetMock.mockReturnValue(mockProduct.id);

      component.ngOnInit();

      const request = httpMock.expectOne((req) =>
        req.url.endsWith('/products'),
      );

      expect(request.request.method).toBe('GET');

      request.flush({
        data: [mockProduct],
      });

      expect(component.isEditMode()).toBe(true);
      expect(component.editingProductId()).toBe(mockProduct.id);
      expect(component.pageTitle()).toBe('Formulario de Edición');
      expect(component.idControl.disabled).toBe(true);
      expect(component.revisionDateControl.disabled).toBe(true);
    });
  });

  describe('Normalización del ID', () => {
    it('debe convertir ID a minúsculas y reemplazar espacios por guiones', () => {
      component.productForm.patchValue({
        id: 'Mi   Tarjeta CREDITO',
      });

      component.normalizeId();

      expect(component.idControl.value).toBe('mi-tarjeta-credito');
    });

    it('no debe modificar el ID en modo edición', () => {
      component.editingProductId.set(mockProduct.id);

      component.productForm.patchValue({
        id: 'TARJETA CREDITO',
      });

      component.normalizeId();

      expect(component.idControl.value).toBe('TARJETA CREDITO');
    });

    it('debe limpiar el error idTaken al normalizar', () => {
      component.productForm.patchValue({
        id: 'producto-prueba',
      });

      component.checkIdAvailability();

      const request = httpMock.expectOne((req) =>
        req.url.includes('/verification/producto-prueba'),
      );

      request.flush(true);

      expect(component.idControl.hasError('idTaken')).toBe(true);

      component.normalizeId();

      expect(component.idControl.hasError('idTaken')).toBe(false);
    });
  });

  describe('Fechas', () => {
    it('debe calcular la fecha de revisión un año después', () => {
      component.productForm.patchValue({
        date_release: '2026-08-01',
      });

      component.onReleaseDateChange();

      expect(component.revisionDateControl.value).toBe('2027-08-01');
    });

    it('debe limpiar la fecha de revisión si se elimina la fecha de liberación', () => {
      component.revisionDateControl.enable();
      component.revisionDateControl.setValue('2027-08-01');

      component.productForm.patchValue({
        date_release: '',
      });

      component.onReleaseDateChange();

      expect(component.revisionDateControl.value).toBe('');
    });

    it('debe marcar como inválida una fecha de liberación pasada', () => {
      component.productForm.patchValue({
        date_release: '2020-01-01',
      });

      expect(
        component.releaseDateControl.hasError('releaseDateInPast'),
      ).toBe(true);
    });
  });

  describe('Disponibilidad del ID', () => {
    it('debe consultar disponibilidad del ID válido', () => {
      component.productForm.patchValue({
        id: 'nuevo-id',
      });

      component.checkIdAvailability();

      const request = httpMock.expectOne((req) =>
        req.url.includes('/verification/nuevo-id'),
      );

      expect(request.request.method).toBe('GET');

      request.flush(false);

      expect(component.isCheckingId()).toBe(false);
      expect(component.idControl.hasError('idTaken')).toBe(false);
    });

    it('debe marcar el ID como tomado cuando ya existe', () => {
      component.productForm.patchValue({
        id: 'tarjeta-credito',
      });

      component.checkIdAvailability();

      const request = httpMock.expectOne((req) =>
        req.url.includes('/verification/tarjeta-credito'),
      );

      request.flush(true);

      expect(component.idControl.hasError('idTaken')).toBe(true);
    });

    it('no debe verificar un ID con formato inválido', () => {
      component.productForm.patchValue({
        id: 'ID inválido!!!',
      });

      component.checkIdAvailability();

      httpMock.expectNone((req) => req.url.includes('/verification/'));
    });

    it('no debe verificar el ID en modo edición', () => {
      component.editingProductId.set(mockProduct.id);

      component.productForm.patchValue({
        id: 'otro-id',
      });

      component.checkIdAvailability();

      httpMock.expectNone((req) => req.url.includes('/verification/'));
    });
  });

  describe('Creación de producto', () => {
    it('debe crear producto y navegar al listado', () => {
      fillValidCreateForm();

      component.onSubmit();

      const verificationRequest = httpMock.expectOne((req) =>
        req.url.includes('/verification/nuevo-producto'),
      );

      verificationRequest.flush(false);

      const createRequest = httpMock.expectOne((req) =>
        req.method === 'POST' && req.url.endsWith('/products'),
      );

      expect(createRequest.request.body.id).toBe('nuevo-producto');

      createRequest.flush({
        data: mockProduct,
      });

      expect(navigateByUrlMock).toHaveBeenCalledWith('/products');
    });

    it('debe mostrar notificación de éxito al crear', () => {
      const successSpy = vi.spyOn(notificationService, 'success');

      fillValidCreateForm();

      component.onSubmit();

      httpMock
        .expectOne((req) => req.url.includes('/verification/nuevo-producto'))
        .flush(false);

      httpMock
        .expectOne(
          (req) => req.method === 'POST' && req.url.endsWith('/products'),
        )
        .flush({
          data: mockProduct,
        });

      expect(successSpy).toHaveBeenCalledWith(
        'Producto creado correctamente.',
      );
    });

    it('no debe crear producto cuando el ID ya existe', () => {
      fillValidCreateForm();

      component.onSubmit();

      httpMock
        .expectOne((req) => req.url.includes('/verification/nuevo-producto'))
        .flush(true);

      expect(component.idControl.hasError('idTaken')).toBe(true);

      httpMock.expectNone((req) => req.method === 'POST');
    });
  });

  describe('Edición de producto', () => {
    beforeEach(() => {
      prepareEditMode();
    });

    it('debe actualizar el producto sin incluir el ID en el body', () => {
      component.productForm.patchValue({
        name: 'Tarjeta Actualizada',
        description: 'Descripción actualizada correctamente.',
      });

      component.onSubmit();

      const updateRequest = httpMock.expectOne((req) =>
        req.method === 'PUT' &&
        req.url.includes(`/products/${mockProduct.id}`),
      );

      expect(updateRequest.request.body.id).toBeUndefined();
      expect(updateRequest.request.body.name).toBe('Tarjeta Actualizada');

      updateRequest.flush({
        data: mockProduct,
      });

      expect(navigateByUrlMock).toHaveBeenCalledWith('/products');
    });

    it('debe mostrar notificación de éxito al actualizar', () => {
      const successSpy = vi.spyOn(notificationService, 'success');

      component.onSubmit();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'PUT' &&
            req.url.includes(`/products/${mockProduct.id}`),
        )
        .flush({
          data: mockProduct,
        });

      expect(successSpy).toHaveBeenCalledWith(
        'Producto actualizado correctamente.',
      );
    });
  });

  describe('Validaciones', () => {
    it('debe requerir nombre', () => {
      component.productForm.patchValue({
        name: '',
      });

      expect(component.nameControl.hasError('required')).toBe(true);
    });

    it('debe requerir descripción', () => {
      component.productForm.patchValue({
        description: '',
      });

      expect(component.descriptionControl.hasError('required')).toBe(true);
    });

    it('debe requerir logo', () => {
      component.productForm.patchValue({
        logo: '',
      });

      expect(component.logoControl.hasError('required')).toBe(true);
    });

    it('debe rechazar una URL de logo inválida', () => {
      component.productForm.patchValue({
        logo: 'no-es-una-url',
      });

      expect(component.logoControl.hasError('invalidUrl')).toBe(true);
    });

    it('debe aceptar URL HTTPS válida', () => {
      component.productForm.patchValue({
        logo: 'https://www.visa.com.ec/logo.png',
      });

      expect(component.logoControl.hasError('invalidUrl')).toBe(false);
    });

    it('debe aceptar URL HTTP válida según la regla actual', () => {
      component.productForm.patchValue({
        logo: 'http://example.com/logo.png',
      });

      expect(component.logoControl.hasError('invalidUrl')).toBe(false);
    });
  });

  describe('Reinicio del formulario', () => {
    it('debe limpiar los campos en modo creación', () => {
      fillValidCreateForm();

      component.resetForm();

      expect(component.idControl.value).toBe('');
      expect(component.nameControl.value).toBe('');
      expect(component.descriptionControl.value).toBe('');
      expect(component.logoControl.value).toBe('');
      expect(component.serverError()).toBeNull();
    });

    it('debe limpiar el error de servidor al reiniciar', () => {
      component.serverError.set('Error de prueba.');

      component.resetForm();

      expect(component.serverError()).toBeNull();
    });
  });

  describe('Estados visuales', () => {
    it('debe mostrar Guardando mientras se está creando', () => {
      component.isSubmitting.set(true);

      expect(component.submitLabel()).toBe('Guardando...');
    });

    it('debe mostrar Actualizando mientras se está editando', () => {
      component.editingProductId.set(mockProduct.id);
      component.isSubmitting.set(true);

      expect(component.submitLabel()).toBe('Actualizando...');
    });
  });
});
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductApiService } from '../../../../core/services/financial-product-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductListPage } from './product-list.page';

describe('ProductListPage', () => {
  let component: ProductListPage;
  let fixture: ComponentFixture<ProductListPage>;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;

  const mockProducts: FinancialProduct[] = [
    {
      id: 'tarjeta-credito',
      name: 'Tarjeta de Crédito',
      description: 'Tarjeta de crédito con beneficios exclusivos.',
      logo: 'https://www.visa.com.ec/dam/logo.png',
      date_release: '2026-07-01',
      date_revision: '2027-07-01',
    },
    {
      id: 'cuenta-ahorro',
      name: 'Cuenta de Ahorro',
      description: 'Cuenta de ahorro con intereses competitivos.',
      logo: 'https://cdn.example.com/bank.png',
      date_release: '2026-06-15',
      date_revision: '2027-06-15',
    },
  ];

  const paginatedProducts: FinancialProduct[] = [
    ...mockProducts,
    {
      id: 'prestamo-personal',
      name: 'Préstamo Personal',
      description: 'Financiamiento flexible para necesidades personales.',
      logo: 'https://example.com/prestamo.png',
      date_release: '2026-08-01',
      date_revision: '2027-08-01',
    },
    {
      id: 'cuenta-digital',
      name: 'Cuenta Digital',
      description: 'Cuenta para operar desde canales digitales.',
      logo: 'https://example.com/digital.png',
      date_release: '2026-08-02',
      date_revision: '2027-08-02',
    },
    {
      id: 'tarjeta-debito',
      name: 'Tarjeta de Débito',
      description: 'Tarjeta para compras y retiros de efectivo.',
      logo: 'https://example.com/debito.png',
      date_release: '2026-08-03',
      date_revision: '2027-08-03',
    },
    {
      id: 'seguro-vida',
      name: 'Seguro de Vida',
      description: 'Protección financiera para ti y tu familia.',
      logo: 'https://example.com/vida.png',
      date_release: '2026-08-04',
      date_revision: '2027-08-04',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListPage,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        FinancialProductApiService,
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    notificationService.close();
    httpMock.verify();
    vi.restoreAllMocks();
  });

  function loadProducts(products: FinancialProduct[] = mockProducts): void {
    component.ngOnInit();

    const request = httpMock.expectOne((req) =>
      req.method === 'GET' && req.url.endsWith('/products'),
    );

    request.flush({ data: products });
  }

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('Carga de productos', () => {
    it('debe cargar productos al iniciar', () => {
      loadProducts();

      expect(component.products()).toEqual(mockProducts);
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('debe mantener loading mientras la petición está pendiente', () => {
      component.ngOnInit();

      expect(component.isLoading()).toBe(true);

      httpMock
        .expectOne((req) => req.method === 'GET' && req.url.endsWith('/products'))
        .flush({ data: mockProducts });

      expect(component.isLoading()).toBe(false);
    });

    it('debe mostrar error si el backend no está disponible', () => {
      component.ngOnInit();

      httpMock
        .expectOne((req) => req.method === 'GET' && req.url.endsWith('/products'))
        .error(new ProgressEvent('network-error'), { status: 0 });

      expect(component.products()).toEqual([]);
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toContain('backend esté iniciado');
    });

    it('debe mostrar error genérico para otros fallos', () => {
      component.ngOnInit();

      httpMock
        .expectOne((req) => req.method === 'GET' && req.url.endsWith('/products'))
        .flush(
          { message: 'Error interno' },
          { status: 500, statusText: 'Server Error' },
        );

      expect(component.errorMessage()).toContain(
        'No fue posible cargar los productos financieros',
      );
    });
  });

  describe('Búsqueda y filtrado', () => {
    beforeEach(() => {
      loadProducts();
    });

    it('debe filtrar por nombre', () => {
      component.onSearch('Tarjeta');

      expect(component.filteredProducts()).toHaveLength(1);
      expect(component.filteredProducts()[0].id).toBe('tarjeta-credito');
    });

    it('debe filtrar por descripción', () => {
      component.onSearch('intereses');

      expect(component.filteredProducts()).toHaveLength(1);
      expect(component.filteredProducts()[0].id).toBe('cuenta-ahorro');
    });

    it('debe filtrar por identificador', () => {
      component.onSearch('tarjeta-credito');

      expect(component.filteredProducts()).toHaveLength(1);
      expect(component.filteredProducts()[0].name).toBe(
        'Tarjeta de Crédito',
      );
    });

    it('debe ignorar mayúsculas y minúsculas en la búsqueda', () => {
      component.onSearch('TARJETA');

      expect(component.filteredProducts()).toHaveLength(1);
    });

    it('debe reiniciar la página al buscar', () => {
      component.currentPage.set(2);

      component.onSearch('tarjeta');

      expect(component.currentPage()).toBe(1);
    });

    it('debe cerrar el menú de acciones al buscar', () => {
      component.openMenuProductId.set(mockProducts[0].id);

      component.onSearch('tarjeta');

      expect(component.openMenuProductId()).toBeNull();
    });

    it('debe devolver todos los productos con búsqueda vacía', () => {
      component.onSearch('');

      expect(component.filteredProducts()).toEqual(mockProducts);
    });

    it('debe devolver lista vacía si no existen coincidencias', () => {
      component.onSearch('producto-inexistente');

      expect(component.filteredProducts()).toEqual([]);
    });
  });

  describe('Paginación', () => {
    beforeEach(() => {
      loadProducts(paginatedProducts);
    });

    it('debe mostrar cinco productos por defecto', () => {
      expect(component.pageSize()).toBe(5);
      expect(component.paginatedProducts()).toHaveLength(5);
      expect(component.totalPages()).toBe(2);
    });

    it('debe ir a la siguiente página', () => {
      component.goToNextPage();

      expect(component.currentPage()).toBe(2);
      expect(component.paginatedProducts()).toHaveLength(1);
      expect(component.paginatedProducts()[0].id).toBe('seguro-vida');
    });

    it('debe volver a la página anterior', () => {
      component.goToNextPage();
      component.goToPreviousPage();

      expect(component.currentPage()).toBe(1);
    });

    it('no debe ir a una página anterior desde la primera', () => {
      component.goToPreviousPage();

      expect(component.currentPage()).toBe(1);
    });

    it('no debe ir a una página siguiente desde la última', () => {
      component.goToNextPage();
      component.goToNextPage();

      expect(component.currentPage()).toBe(2);
    });

    it('debe cambiar a diez productos por página', () => {
      component.onPageSizeChange('10');

      expect(component.pageSize()).toBe(10);
      expect(component.currentPage()).toBe(1);
      expect(component.paginatedProducts()).toHaveLength(6);
      expect(component.totalPages()).toBe(1);
    });

    it('debe ignorar tamaños de página no permitidos', () => {
      component.onPageSizeChange('1');

      expect(component.pageSize()).toBe(5);
    });

    it('debe cerrar el menú de acciones al cambiar página', () => {
      component.openMenuProductId.set(mockProducts[0].id);

      component.goToNextPage();

      expect(component.openMenuProductId()).toBeNull();
    });
  });

  describe('Menú de acciones', () => {
    beforeEach(() => {
      loadProducts();
    });

    it('debe abrir el menú de acciones', () => {
      component.toggleActionsMenu(mockProducts[0].id);

      expect(component.openMenuProductId()).toBe(mockProducts[0].id);
    });

    it('debe cerrar el menú si se presiona nuevamente', () => {
      component.toggleActionsMenu(mockProducts[0].id);
      component.toggleActionsMenu(mockProducts[0].id);

      expect(component.openMenuProductId()).toBeNull();
    });

    it('debe cambiar el menú abierto al seleccionar otro producto', () => {
      component.toggleActionsMenu(mockProducts[0].id);
      component.toggleActionsMenu(mockProducts[1].id);

      expect(component.openMenuProductId()).toBe(mockProducts[1].id);
    });
  });

  describe('Eliminación de productos', () => {
    beforeEach(() => {
      loadProducts();
    });

    it('debe abrir el modal de confirmación', () => {
      component.openDeleteModal(mockProducts[0]);

      expect(component.productPendingDeletion()).toEqual(mockProducts[0]);
      expect(component.isDeleteModalOpen()).toBe(true);
      expect(component.deleteError()).toBeNull();
    });

    it('debe cerrar el modal cuando no se está eliminando', () => {
      component.openDeleteModal(mockProducts[0]);

      component.closeDeleteModal();

      expect(component.productPendingDeletion()).toBeNull();
      expect(component.isDeleteModalOpen()).toBe(false);
    });

    it('no debe cerrar el modal mientras se está eliminando', () => {
      component.openDeleteModal(mockProducts[0]);
      component.isDeleting.set(true);

      component.closeDeleteModal();

      expect(component.productPendingDeletion()).toEqual(mockProducts[0]);
    });

    it('debe eliminar producto correctamente', () => {
      component.openDeleteModal(mockProducts[0]);
      component.confirmDelete();

      const request = httpMock.expectOne((req) =>
        req.method === 'DELETE' &&
        req.url.includes(`/products/${mockProducts[0].id}`),
      );

      request.flush({ data: null });

      expect(component.products()).toEqual([mockProducts[1]]);
      expect(component.productPendingDeletion()).toBeNull();
      expect(component.isDeleting()).toBe(false);
    });

    it('debe mostrar notificación de éxito al eliminar', () => {
      const successSpy = vi.spyOn(notificationService, 'success');

      component.openDeleteModal(mockProducts[0]);
      component.confirmDelete();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'DELETE' &&
            req.url.includes(`/products/${mockProducts[0].id}`),
        )
        .flush({ data: null });

      expect(successSpy).toHaveBeenCalledWith(
        'Producto eliminado correctamente.',
      );
    });

    it('debe quitar producto localmente si API responde 404', () => {
      const infoSpy = vi.spyOn(notificationService, 'info');

      component.openDeleteModal(mockProducts[0]);
      component.confirmDelete();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'DELETE' &&
            req.url.includes(`/products/${mockProducts[0].id}`),
        )
        .flush(
          { message: 'Not found' },
          { status: 404, statusText: 'Not Found' },
        );

      expect(component.products()).toEqual([mockProducts[1]]);
      expect(component.productPendingDeletion()).toBeNull();
      expect(infoSpy).toHaveBeenCalledWith(
        'Este producto ya no existe. La lista fue actualizada.',
      );
    });

    it('debe mostrar error contextual si falla la eliminación', () => {
      component.openDeleteModal(mockProducts[0]);
      component.confirmDelete();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'DELETE' &&
            req.url.includes(`/products/${mockProducts[0].id}`),
        )
        .flush(
          { message: 'Error' },
          { status: 500, statusText: 'Server Error' },
        );

      expect(component.products()).toEqual(mockProducts);
      expect(component.deleteError()).toContain(
        'No fue posible eliminar el producto',
      );
      expect(component.productPendingDeletion()).toEqual(mockProducts[0]);
    });

    it('debe regresar a la página anterior si elimina el último elemento', () => {
      component.products.set(paginatedProducts);
      component.pageSize.set(5);
      component.currentPage.set(2);

      const lastProduct = paginatedProducts[5];

      component.openDeleteModal(lastProduct);
      component.confirmDelete();

      httpMock
        .expectOne(
          (req) =>
            req.method === 'DELETE' &&
            req.url.includes(`/products/${lastProduct.id}`),
        )
        .flush({ data: null });

      expect(component.currentPage()).toBe(1);
    });
  });
});
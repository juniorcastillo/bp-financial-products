import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG } from '../config/api.config';
import {
  FinancialProduct,
  UpdateFinancialProductPayload,
} from '../models/financial-product.model';
import { FinancialProductApiService } from './financial-product-api.service';

describe('FinancialProductApiService', () => {
  let service: FinancialProductApiService;
  let httpTesting: HttpTestingController;

  const baseUrl = `${API_CONFIG.baseUrl}/products`;

  const product: FinancialProduct = {
    id: 'tarjeta-credito',
    name: 'Tarjeta de Crédito Premium',
    description: 'Tarjeta para compras, beneficios y financiamiento flexible.',
    logo: 'https://example.com/logo.png',
    date_release: '2026-07-01',
    date_revision: '2027-07-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FinancialProductApiService,
      ],
    });

    service = TestBed.inject(FinancialProductApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener todos los productos', () => {
    service.getAll().subscribe((response) => {
      expect(response.data).toEqual([product]);
    });

    const request = httpTesting.expectOne(baseUrl);

    expect(request.request.method).toBe('GET');

    request.flush({
      data: [product],
    });
  });

  it('debe crear un producto', () => {
    service.create(product).subscribe((response) => {
      expect(response.message).toBe('Producto creado correctamente');
    });

    const request = httpTesting.expectOne(baseUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(product);

    request.flush({
      message: 'Producto creado correctamente',
      data: product,
    });
  });

  it('debe actualizar un producto sin enviar el ID en el body', () => {
    const payload: UpdateFinancialProductPayload = {
      name: 'Tarjeta de Crédito Gold',
      description: 'Tarjeta actualizada con beneficios y financiamiento.',
      logo: 'https://example.com/logo-gold.png',
      date_release: '2026-07-01',
      date_revision: '2027-07-01',
    };

    service.update(product.id, payload).subscribe((response) => {
      expect(response.message).toBe('Producto actualizado correctamente');
    });

    const request = httpTesting.expectOne(`${baseUrl}/${product.id}`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body.id).toBeUndefined();

    request.flush({
      message: 'Producto actualizado correctamente',
      data: {
        id: product.id,
        ...payload,
      },
    });
  });

  it('debe eliminar un producto', () => {
    service.remove(product.id).subscribe((response) => {
      expect(response.message).toBe('Producto eliminado correctamente');
    });

    const request = httpTesting.expectOne(`${baseUrl}/${product.id}`);

    expect(request.request.method).toBe('DELETE');

    request.flush({
      message: 'Producto eliminado correctamente',
    });
  });

  it('debe verificar si un ID existe', () => {
    service.exists(product.id).subscribe((exists) => {
      expect(exists).toBe(true);
    });

    const request = httpTesting.expectOne(
      `${baseUrl}/verification/${product.id}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(true);
  });

  it('debe codificar IDs con espacios o caracteres especiales', () => {
    const productId = 'tarjeta oro/2026';

    service.exists(productId).subscribe();

    const request = httpTesting.expectOne(
      `${baseUrl}/verification/${encodeURIComponent(productId)}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush(false);
  });
});
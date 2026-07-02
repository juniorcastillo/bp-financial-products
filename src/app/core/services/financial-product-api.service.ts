import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import {
  ApiDataResponse,
  ApiMessageResponse,
} from '../models/api-response.model';
import {
  CreateFinancialProductPayload,
  FinancialProduct,
  UpdateFinancialProductPayload,
} from '../models/financial-product.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/products`;

  getAll(): Observable<ApiDataResponse<FinancialProduct[]>> {
    return this.http.get<ApiDataResponse<FinancialProduct[]>>(this.baseUrl);
  }

  create(
    product: CreateFinancialProductPayload,
  ): Observable<ApiMessageResponse<FinancialProduct>> {
    return this.http.post<ApiMessageResponse<FinancialProduct>>(
      this.baseUrl,
      product,
    );
  }

  update(
    id: string,
    product: UpdateFinancialProductPayload,
  ): Observable<ApiMessageResponse<FinancialProduct>> {
    return this.http.put<ApiMessageResponse<FinancialProduct>>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      product,
    );
  }

  remove(id: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
    );
  }

  exists(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/verification/${encodeURIComponent(id)}`,
    );
  }
}
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductApiService } from '../../../../core/services/financial-product-api.service';
import { NotificationService } from '../../../../core/services/notification.service';

type PageSize = 5 | 10 | 20;

@Component({
  selector: 'app-product-list-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  private readonly financialProductApi = inject(FinancialProductApiService);
  private readonly notificationService = inject(NotificationService);

  readonly products = signal<FinancialProduct[]>([]);
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal<PageSize>(5);
  readonly openMenuProductId = signal<string | null>(null);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly productPendingDeletion = signal<FinancialProduct | null>(null);
  readonly isDeleteModalOpen = computed(
    () => this.productPendingDeletion() !== null,
  );
  readonly isDeleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();

    if (!term) {
      return this.products();
    }

    return this.products().filter((product) => {
      return (
        product.name.toLocaleLowerCase().includes(term) ||
        product.description.toLocaleLowerCase().includes(term) ||
        product.id.toLocaleLowerCase().includes(term)
      );
    });
  });

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.filteredProducts().length / this.pageSize()),
    ),
  );

  readonly paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();

    return this.filteredProducts().slice(
      startIndex,
      startIndex + this.pageSize(),
    );
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.openMenuProductId.set(null);

    this.financialProductApi
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.products.set(data);
          this.currentPage.set(1);
        },
        error: (error: HttpErrorResponse) => {
          this.products.set([]);

          this.errorMessage.set(
            error.status === 0
              ? 'No fue posible conectar con el servidor. Verifica que el backend esté iniciado.'
              : 'No fue posible cargar los productos financieros. Intenta nuevamente.',
          );
        },
      });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.openMenuProductId.set(null);
  }

  onPageSizeChange(value: string): void {
    const pageSize = Number(value) as PageSize;

    if (pageSize === 5 || pageSize === 10 || pageSize === 20) {
      this.pageSize.set(pageSize);
      this.currentPage.set(1);
      this.openMenuProductId.set(null);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update((page) => page - 1);
    this.openMenuProductId.set(null);
  }

  goToNextPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.currentPage.update((page) => page + 1);
    this.openMenuProductId.set(null);
  }

  toggleActionsMenu(productId: string): void {
    this.openMenuProductId.update((currentId) =>
      currentId === productId ? null : productId,
    );
  }

  openDeleteModal(product: FinancialProduct): void {
    this.openMenuProductId.set(null);
    this.deleteError.set(null);
    this.productPendingDeletion.set(product);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) {
      return;
    }

    this.deleteError.set(null);
    this.productPendingDeletion.set(null);
  }

  confirmDelete(): void {
    const product = this.productPendingDeletion();

    if (!product || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.financialProductApi
      .remove(product.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.removeProductFromList(product.id);
          this.productPendingDeletion.set(null);

          this.notificationService.success(
            'Producto eliminado correctamente.',
          );
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.removeProductFromList(product.id);
            this.productPendingDeletion.set(null);

            this.notificationService.info(
              'Este producto ya no existe. La lista fue actualizada.',
            );

            return;
          }

          this.deleteError.set(
            'No fue posible eliminar el producto. Intenta nuevamente.',
          );
        },
      });
  }

  private removeProductFromList(productId: string): void {
    this.products.update((products) =>
      products.filter((product) => product.id !== productId),
    );

    this.adjustCurrentPageAfterDeletion();
  }

  private adjustCurrentPageAfterDeletion(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }
}
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { finalize } from 'rxjs';

import {
  CreateFinancialProductPayload,
  FinancialProduct,
  UpdateFinancialProductPayload,
} from '../../../../core/models/financial-product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialProductApiService } from '../../../../core/services/financial-product-api.service';
import { addOneYear, toIsoDate } from '../../../../shared/utils/date.utils';
import {
  notBlankValidator,
  validHttpUrlValidator,
} from '../../validators/product-field.validators';
import {
  releaseDateNotInPastValidator,
  revisionDateMatchesReleaseValidator,
} from '../../validators/product-date.validators';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
})
export class ProductFormPage implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly financialProductApi = inject(FinancialProductApiService);
  private readonly notificationService = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly isCheckingId = signal(false);
  readonly isLoadingProduct = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly productNotFound = signal(false);

  readonly editingProductId = signal<string | null>(null);

  readonly isEditMode = computed(() => this.editingProductId() !== null);

  readonly pageTitle = computed(() =>
    this.isEditMode()
      ? 'Formulario de Edición'
      : 'Formulario de Registro',
  );

  readonly submitLabel = computed(() => {
    if (this.isSubmitting()) {
      return this.isEditMode() ? 'Actualizando...' : 'Guardando...';
    }

    return this.isEditMode() ? 'Actualizar' : 'Enviar';
  });

  readonly minReleaseDate = toIsoDate(new Date());

  readonly productForm = this.formBuilder.group(
    {
      id: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          notBlankValidator(),
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          notBlankValidator(),
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: [
        '',
        [
          Validators.required,
          notBlankValidator(),
          validHttpUrlValidator(),
        ],
      ],
      date_release: [
        '',
        [Validators.required, releaseDateNotInPastValidator()],
      ],
      date_revision: [
        { value: '', disabled: true },
        [Validators.required],
      ],
    },
    {
      validators: [revisionDateMatchesReleaseValidator()],
    },
  );

  get idControl() {
    return this.productForm.controls.id;
  }

  get nameControl() {
    return this.productForm.controls.name;
  }

  get descriptionControl() {
    return this.productForm.controls.description;
  }

  get logoControl() {
    return this.productForm.controls.logo;
  }

  get releaseDateControl() {
    return this.productForm.controls.date_release;
  }

  get revisionDateControl() {
    return this.productForm.controls.date_revision;
  }

  ngOnInit(): void {
    const productId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!productId) {
      return;
    }

    this.editingProductId.set(productId);
    this.loadProductForEdition(productId);
  }

  normalizeId(): void {
    if (this.isEditMode()) {
      return;
    }

    const normalizedId = this.idControl.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    this.idControl.setValue(normalizedId);
    this.idControl.markAsTouched();
    this.setIdTakenError(false);
  }

  onReleaseDateChange(): void {
    const releaseDate = this.releaseDateControl.value;

    this.revisionDateControl.setValue(
      releaseDate ? addOneYear(releaseDate) : '',
    );

    this.productForm.updateValueAndValidity();
  }

  checkIdAvailability(): void {
    if (this.isEditMode()) {
      return;
    }

    this.normalizeId();

    const id = this.idControl.value;

    if (!id || this.idControl.invalid) {
      return;
    }

    this.isCheckingId.set(true);

    this.financialProductApi
      .exists(id)
      .pipe(finalize(() => this.isCheckingId.set(false)))
      .subscribe({
        next: (exists) => this.setIdTakenError(exists),
        error: () => {
          this.serverError.set(
            'No fue posible validar la disponibilidad del ID. Intenta nuevamente.',
          );
        },
      });
  }

  onSubmit(): void {
    this.serverError.set(null);

    if (!this.isEditMode()) {
      this.normalizeId();
    }

    this.productForm.markAllAsTouched();

    if (
      this.productForm.invalid ||
      this.isSubmitting() ||
      this.isLoadingProduct()
    ) {
      return;
    }

    if (this.isEditMode()) {
      this.updateProduct();
      return;
    }

    this.createProduct();
  }

  resetForm(): void {
    if (this.isEditMode()) {
      const productId = this.editingProductId();

      if (productId) {
        this.loadProductForEdition(productId);
      }

      return;
    }

    this.productForm.reset({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: '',
    });

    this.serverError.set(null);
  }

  private loadProductForEdition(productId: string): void {
    this.isLoadingProduct.set(true);
    this.serverError.set(null);
    this.productNotFound.set(false);

    this.financialProductApi
      .getAll()
      .pipe(finalize(() => this.isLoadingProduct.set(false)))
      .subscribe({
        next: ({ data }) => {
          const product = data.find((item) => item.id === productId);

          if (!product) {
            this.productNotFound.set(true);
            return;
          }

          this.populateFormForEdition(product);
        },
        error: () => {
          this.serverError.set(
            'No fue posible cargar el producto para editarlo.',
          );
        },
      });
  }

  private populateFormForEdition(product: FinancialProduct): void {
    this.productForm.reset({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    });

    this.idControl.disable({ emitEvent: false });
    this.revisionDateControl.disable({ emitEvent: false });

    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }

  private createProduct(): void {
    const rawValue = this.productForm.getRawValue();

    const product: CreateFinancialProductPayload = {
      id: rawValue.id.trim(),
      name: rawValue.name.trim(),
      description: rawValue.description.trim(),
      logo: rawValue.logo.trim(),
      date_release: rawValue.date_release,
      date_revision: rawValue.date_revision,
    };

    this.isSubmitting.set(true);

    this.financialProductApi
      .exists(product.id)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (exists) => {
          if (exists) {
            this.setIdTakenError(true);
            this.idControl.markAsTouched();
            return;
          }

          this.persistNewProduct(product);
        },
        error: () => {
          this.serverError.set(
            'No fue posible verificar la disponibilidad del identificador.',
          );
        },
      });
  }

  private persistNewProduct(product: CreateFinancialProductPayload): void {
    this.isSubmitting.set(true);

    this.financialProductApi
      .create(product)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Producto creado correctamente.',
          );

          void this.router.navigateByUrl('/products');
        },
        error: (error: HttpErrorResponse) => {
          this.serverError.set(
            error.status === 400
              ? 'No fue posible guardar el producto. Revisa los datos ingresados.'
              : 'Ocurrió un error al crear el producto financiero.',
          );
        },
      });
  }

  private updateProduct(): void {
    const productId = this.editingProductId();

    if (!productId) {
      return;
    }

    const rawValue = this.productForm.getRawValue();

    const payload: UpdateFinancialProductPayload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim(),
      logo: rawValue.logo.trim(),
      date_release: rawValue.date_release,
      date_revision: rawValue.date_revision,
    };

    this.isSubmitting.set(true);

    this.financialProductApi
      .update(productId, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Producto actualizado correctamente.',
          );

          void this.router.navigateByUrl('/products');
        },
        error: (error: HttpErrorResponse) => {
          this.serverError.set(
            error.status === 400
              ? 'No fue posible actualizar el producto. Revisa los datos ingresados.'
              : 'Ocurrió un error al actualizar el producto financiero.',
          );
        },
      });
  }

  private setIdTakenError(exists: boolean): void {
    const currentErrors = this.idControl.errors ?? {};

    if (exists) {
      this.idControl.setErrors({
        ...currentErrors,
        idTaken: true,
      });

      return;
    }

    const { idTaken, ...remainingErrors } = currentErrors;

    this.idControl.setErrors(
      Object.keys(remainingErrors).length > 0 ? remainingErrors : null,
    );
  }
}
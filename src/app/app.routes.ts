import { Routes } from '@angular/router';

import { ProductFormPage } from './feature/products/pages/product-form/product-form.page';
import { ProductListPage } from './feature/products/pages/product-list/product-list.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products/new',
    component: ProductFormPage,
    title: 'Registrar producto | Banco',
  },
  {
    path: 'products/:id/edit',
    component: ProductFormPage,
    title: 'Editar producto | Banco',
  },
  {
    path: 'products',
    component: ProductListPage,
    title: 'Productos financieros | Banco',
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
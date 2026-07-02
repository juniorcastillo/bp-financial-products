export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export type CreateFinancialProductPayload = FinancialProduct;

export type UpdateFinancialProductPayload = Omit<FinancialProduct, 'id'>;
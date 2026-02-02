export enum PaymentType {
  FISCAL = 'Fiscal (Impuestos)',
  PARAFISCAL = 'Parafiscal (SSO, INCES, etc.)',
  SERVICIO = 'Servicio Público',
  MUNICIPAL = 'Impuesto Municipal',
  OTRO = 'Otro'
}

export type UserRole = 'admin' | 'payer' | 'viewer';

export interface User {
  username: string;
  name: string;
  role: UserRole;
}

export type PaymentStatus = 'Pending Review' | 'Approved' | 'Rejected';

export interface PaymentRecord {
  id: string;
  dateRegistered: string;
  organism: string;
  paymentType: PaymentType;
  amount: number;
  paymentDateReal: string;
  unitCode: string;
  unitName: string;
  municipality: string;
  status: PaymentStatus;
  description?: string;
  contactPhone?: string;
}

export interface BudgetSummary {
  type: string;
  totalSpent: number;
  projectedAnnual: number;
  count: number;
}
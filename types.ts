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
  status: 'Pending' | 'Paid';
  description?: string;
  contactPhone?: string; // New field for WhatsApp notifications
}

export interface BudgetSummary {
  type: string;
  totalSpent: number;
  projectedAnnual: number;
  count: number;
}
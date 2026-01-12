
export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Standardized password storage
  role: UserRole;
  commissionRate?: number; // e.g., 0.4 for 40%
  serviceIds?: string[]; // IDs of services this professional provides
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Appointment {
  id: string;
  professionalId: string;
  serviceId: string;
  clientName: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCommissions: number;
  netProfit: number;
}

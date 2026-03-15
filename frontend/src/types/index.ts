export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  organizationId: string | null;
  organization?: Organization;
  assignedMeters?: Meter[];
  createdAt: string;
  updatedAt: string;
}

export interface Meter {
  id: string;
  name: string;
  organizationId: string;
  organization?: Organization;
  createdAt: string;
}

export interface MeterReading {
  id: string;
  meterId: string;
  timestamp: string;
  indexKwh: number;
  consumptionKwh: number | null;
  createdAt: string;
}

export interface ReportData {
  meterId: string;
  meterName: string;
  organizationId: string;
  organizationName: string;
  readings: {
    id: string;
    timestamp: string;
    indexKwh: number;
    consumptionKwh: number | null;
  }[];
  totalConsumption: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  organizationId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T = undefined> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

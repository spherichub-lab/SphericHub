export interface LensRecord {
  id: string;
  indice: string;
  tipo: string; // New field: Incolor or Photo
  tratamento: string;
  esf: number;
  cil: number;
  quantidade: number;
  data_registro: string;
  company_id: string;
}

export type UserRole = 'admin' | 'user';

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  color_theme?: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_id: string;
  active: boolean;
}

export interface DashboardStats {
  total: number;
  totalPecas: number;
  topIndice: string;
  topTratamento: string;
  topEsf: string;
  topCil: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export type TabType = 'register' | 'dashboard' | 'admin_users' | 'admin_companies';
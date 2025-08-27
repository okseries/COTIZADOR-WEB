// Tipos centralizados para la aplicación

// Import y re-export tipos existentes que se mantendrán
import type { Cliente, Plan, Afiliado, Opcional, ResumenPago } from '@/presentation/quotations/interface/createQuotation.interface';
import type { PlanFormValues, QuotationFormValues } from '@/presentation/quotations/schema/quotatio-schema';
import type { ClienteFormValues } from '@/presentation/client/schema/ClientInfo.schema';

export type { Cliente, Plan, Afiliado, Opcional, ResumenPago, PlanFormValues, QuotationFormValues, ClienteFormValues };

// Tipos unificados para el nuevo store
export interface QuotationRequest {
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
}

export interface FilterData {
  tipoDocumento: "1" | "2" | "3"; // 1: Cédula, 2: RNC, 3: Pasaporte
  identificacion: string;
}

export type QuotationMode = "create" | number;

// Estado unificado del store
export interface UnifiedQuotationState {
  // Modo de operación
  mode: QuotationMode;
  
  // Navigation state
  currentStep: string;
  
  // Datos principales
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
  filterData: FilterData | null;
  agentOptions: unknown[];
  
  // 🆕 Consolidación de búsqueda de clientes
  searchData: { tipoDocumento: string; identificacion: string } | null;
  clientSearchResult: { NOMBRE_COMPLETO: string } | null;
  
  // Datos del stepper
  clientData: Partial<ClienteFormValues>;
  selectedPlans: PlanFormValues[];
  selectedOptionalCoverages: { [planId: string]: number[] };
  paymentPeriod: string;
}

export interface QuotationRequest {
  user: string | null;
cliente: Cliente | null;
  planes: Plan[];
}

export interface Cliente {
  clientChoosen: number;
  identification: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  office: string;
  agent: string;
  agentId?: number;
  tipoPlan: number;
}

export interface Plan {
  plan: string;
  afiliados: Afiliado[];
  opcionales: Opcional[];
  resumenPago: ResumenPago;
  cantidadAfiliados: number;
  tipo: string; // e.g., "VOLUNTARIO"
}

export interface Afiliado {
  plan: string;
  parentesco: string;
  edad: number;
  subtotal: string; // puede ser number si lo manejas como número
  cantidadAfiliados: number;
}

export interface Opcional {
  nombre: string;
  descripcion: string | null;
  prima: number;
}

export interface ResumenPago {
  subTotalAfiliado: number;
  subTotalOpcional: number;
  periodoPago: string; // e.g., "Mensual"
  totalPagar: number;
}

// ============== INTERFACES PARA API RESPONSES ==============
export interface Quotations {
    id:           string;
    user:         string;
    cotizacion:   Cotizacion;
    pdf:          string;
    fecha_creado: string;
}

export interface Cotizacion {
    user:    string;
    cliente: Cliente;
    planes:  Plan[]; // Usar Plan (no Plane) para consistencia
}

// ============== INTERFACES PRINCIPALES ==============
export interface QuotationRequest {
  user: string | null;
cliente: Cliente | null;
  planes: Plan[];
}

export interface Cliente {
  clientChoosen: number;
  identification: string;
  tipoDocumento?: "1" | "2" | "3"; // 1: Cédula, 2: Pasaporte, 3: RNC - Campo para preservar el tipo seleccionado
  name: string;
  contact?: string;
  email?: string;
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
  cantidadAfiliados: number; // Para colectivos: cantidad ingresada manualmente. Para individuales: length de afiliados
  tipo: string; // e.g., "VOLUNTARIO"
}

export interface Afiliado {
  plan: string;
  parentesco: string;
  edad: number; // Para colectivos: debe ser null/0. Para individuales: edad real del afiliado
  subtotal: string; // puede ser number si lo manejas como número
  cantidadAfiliados: number; // Deprecado en favor de Plan.cantidadAfiliados
}

export interface Opcional {
  id: number;
  idCopago?: number ;
  nombre: string;
  descripcion: string | null;
  prima: number;
  tipoOpcionalId?: number; // 🆕 ID del tipo de opcional para mapeo correcto (1=MEDICAMENTOS, 2=ALTO COSTO, 3=HABITACION, 4=ODONTOLOGIA)
  originalOptId?: number; // 🆕 ID original del catálogo para mapeo confiable en edición
}

export interface ResumenPago {
  subTotalAfiliado: number;
  subTotalOpcional: number;
  periodoPago: string; // e.g., "Mensual"
  totalPagar: number;
}

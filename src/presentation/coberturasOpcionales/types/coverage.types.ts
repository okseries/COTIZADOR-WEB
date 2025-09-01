import { CoberturasOpcional } from '../interface/Coberturaopcional.interface';

// Tipos de selecciones de cobertura
export interface CoberturaSelections {
  altoCosto: string;
  medicamentos: string;
  habitacion: string;
  odontologia: string;
}

// Tipo para selecciones dinámicas de copago
export interface DynamicCopagoSelections {
  altoCosto: string;
  medicamentos: string;
  habitacion: string;
}

// Tipo para estados de filtros globales
export interface GlobalFilters {
  altoCosto: boolean;
  medicamentos: boolean;
  habitacion: boolean;
  odontologia: boolean;
}

// Tipo para selecciones por plan
export type PlanSelections = Record<string, Record<string, string>>;

// Tipo para datos de planes - más específico que any[]
export type PlanesData = Record<string, CoberturasOpcional[]>;

// Tipo consolidado para selecciones dinámicas de cobertura
export type DynamicCoberturaSelections = Record<string, CoberturaSelections>;

// Tipo consolidado para selecciones dinámicas de copago
export type DynamicCopagoSelectionsMap = Record<string, DynamicCopagoSelections>;

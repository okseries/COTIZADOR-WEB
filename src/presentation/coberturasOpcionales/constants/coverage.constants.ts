/**
 * Constantes para el manejo de coberturas opcionales
 */

import { OdontologiaOption } from '../ui/components/OdontologiaSelect';

// Tipos de cobertura
export const COVERAGE_TYPES = {
  ALTO_COSTO: 'altoCosto',
  MEDICAMENTOS: 'medicamentos',
  HABITACION: 'habitacion',
  ODONTOLOGIA: 'odontologia'
} as const;

// IDs de tipos opcionales
export const OPTIONAL_TYPE_IDS = {
  MEDICAMENTOS: 1,
  HABITACION: 2,
  ALTO_COSTO: 3,
  ODONTOLOGIA: 4
} as const;

// Valores por defecto
export const DEFAULT_SELECTION_VALUE = "0";

// Opciones de odontología estáticas
export const ODONTOLOGIA_OPTIONS: OdontologiaOption[] = [
  { value: "0", label: "Ninguna (No seleccionar)", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

// Mapeo de nombres a tipo de opcional
export const COVERAGE_NAME_TO_TYPE: Record<string, number> = {
  'MEDICAMENTOS': OPTIONAL_TYPE_IDS.MEDICAMENTOS,
  'COPAGO MEDICAMENTOS': OPTIONAL_TYPE_IDS.MEDICAMENTOS,
  'ALTO COSTO': OPTIONAL_TYPE_IDS.ALTO_COSTO,
  'COPAGO ALTO COSTO': OPTIONAL_TYPE_IDS.ALTO_COSTO,
  'HABITACION': OPTIONAL_TYPE_IDS.HABITACION,
  'HABITACIÓN': OPTIONAL_TYPE_IDS.HABITACION,
  'COPAGO HABITACIÓN': OPTIONAL_TYPE_IDS.HABITACION,
  'COPAGO HABITACION': OPTIONAL_TYPE_IDS.HABITACION,
  'ODONTOLOGIA': OPTIONAL_TYPE_IDS.ODONTOLOGIA,
  'ODONTOLOGÍA': OPTIONAL_TYPE_IDS.ODONTOLOGIA
};

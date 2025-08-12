import { CoberturaOption } from '../ui/components/CoberturaSelect';

// Datos estáticos para simular las opciones de Alto Costo
export const altoCostoOptions: CoberturaOption[] = [
  {
    value: 'alto_costo_100',
    label: 'ALTO COSTO $500,000.00 al 100%',
    descripcion: '$500,000.00 al 100%',
    prima: 171.65,
    porcentaje: 100
  },
  {
    value: 'alto_costo_90',
    label: 'ALTO COSTO $500,000.00 al 90%',
    descripcion: '$500,000.00 al 90%',
    prima: 154.49,
    porcentaje: 90
  },
  {
    value: 'alto_costo_80',
    label: 'ALTO COSTO $500,000.00 al 80%',
    descripcion: '$500,000.00 al 80%',
    prima: 137.32,
    porcentaje: 80
  },
  {
    value: 'alto_costo_70',
    label: 'ALTO COSTO $500,000.00 al 70%',
    descripcion: '$500,000.00 al 70%',
    prima: 120.16,
    porcentaje: 70
  }
];

// Datos estáticos para simular las opciones de Medicamentos
export const medicamentosOptions: CoberturaOption[] = [
  {
    value: 'medicamentos_100',
    label: 'MEDICAMENTOS $8,000.00 al 100%',
    descripcion: '$8,000.00 al 100%',
    prima: 165.29,
    porcentaje: 100
  },
  {
    value: 'medicamentos_90',
    label: 'MEDICAMENTOS $8,000.00 al 90%',
    descripcion: '$8,000.00 al 90%',
    prima: 148.76,
    porcentaje: 90
  },
  {
    value: 'medicamentos_80',
    label: 'MEDICAMENTOS $8,000.00 al 80%',
    descripcion: '$8,000.00 al 80%',
    prima: 132.23,
    porcentaje: 80
  },
  {
    value: 'medicamentos_70',
    label: 'MEDICAMENTOS $8,000.00 al 70%',
    descripcion: '$8,000.00 al 70%',
    prima: 115.70,
    porcentaje: 70
  }
];

// Datos estáticos para simular las opciones de Habitación
export const habitacionOptions: CoberturaOption[] = [
  {
    value: 'habitacion_100',
    label: 'HABITACIÓN $3,500.00 al 100%',
    descripcion: '$3,500.00 al 100%',
    prima: 67.39,
    porcentaje: 100
  },
  {
    value: 'habitacion_90',
    label: 'HABITACIÓN $3,500.00 al 90%',
    descripcion: '$3,500.00 al 90%',
    prima: 60.65,
    porcentaje: 90
  },
  {
    value: 'habitacion_80',
    label: 'HABITACIÓN $3,500.00 al 80%',
    descripcion: '$3,500.00 al 80%',
    prima: 53.91,
    porcentaje: 80
  },
  {
    value: 'habitacion_70',
    label: 'HABITACIÓN $3,500.00 al 70%',
    descripcion: '$3,500.00 al 70%',
    prima: 47.17,
    porcentaje: 70
  }
];

export interface CoberturaSelections {
  altoCosto: string;
  medicamentos: string;
  habitacion: string;
}

export const defaultCoberturaSelections: CoberturaSelections = {
  altoCosto: 'alto_costo_80',
  medicamentos: 'medicamentos_80', 
  habitacion: 'habitacion_100'
};

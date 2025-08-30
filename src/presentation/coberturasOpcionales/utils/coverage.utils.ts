/**
 * Utilidades para el manejo de coberturas opcionales
 */

import { COVERAGE_NAME_TO_TYPE } from '../constants/coverage.constants';
import { CoberturasOpcionaleColectivo } from '../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';

/**
 * Detecta el tipo de opcional basado en el nombre
 */
export const detectOptionalType = (optionalName: string): number => {
  const upperName = optionalName.toUpperCase();
  return COVERAGE_NAME_TO_TYPE[upperName] || 0;
};

/**
 * Extrae información monetaria y porcentaje de una descripción
 */
export const extractDescriptionInfo = (description: string) => {
  const amountMatch = description.match(/RD\$?([\d,]+(?:\.\d{2})?)/);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, '').replace(/\.00$/, '') : null;
  
  const percentageMatch = description.match(/al (\d+)%/);
  const percentage = percentageMatch ? (parseInt(percentageMatch[1]) / 100).toString() : null;
  
  return { amount, percentage };
};

/**
 * Mapea cotización a opt_id usando originalOptId como prioridad
 */
export const mapQuotationToOptId = (
  quotationOptional: Opcional,
  catalogOptions: CoberturasOpcionaleColectivo[]
): string | null => {
  if (!catalogOptions?.length) return null;
  
  // Prioridad 1: Mapeo directo por originalOptId
  if (quotationOptional.originalOptId) {
    const match = catalogOptions.find(opt => opt.opt_id === quotationOptional.originalOptId);
    return match ? match.opt_id.toString() : null;
  }
  
  // Fallback: Mapeo por descripción para cotizaciones legacy
  if (quotationOptional.descripcion) {
    const { amount, percentage } = extractDescriptionInfo(quotationOptional.descripcion);
    
    if (amount && percentage) {
      const match = catalogOptions.find(option => {
        return option.limit_price === amount && option.opt_percentage === percentage;
      });
      return match ? match.opt_id.toString() : null;
    }
  }
  
  return null;
};

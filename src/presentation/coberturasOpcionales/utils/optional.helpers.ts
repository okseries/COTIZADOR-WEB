/**
 * Funciones auxiliares para el procesamiento de opcionales
 */

import { OPTIONAL_TYPE_IDS } from '../constants/coverage.constants';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { CoberturasOpcionaleColectivo, Copago } from '../interface/Coberturaopcional.interface';

/**
 * Crea un opcional de cobertura básica
 */
export const createCoverageOptional = (
  optionData: CoberturasOpcionaleColectivo,
  multiplicador: number,
  copagoId?: string,
  typeId?: number
): Opcional => ({
  id: optionData.opt_id,
  originalOptId: optionData.opt_id,
  idCopago: copagoId ? parseInt(copagoId) : undefined,
  nombre: getOptionalNameByType(typeId || OPTIONAL_TYPE_IDS.MEDICAMENTOS),
  descripcion: optionData.descripcion,
  prima: parseFloat(optionData.opt_prima) * multiplicador,
  tipoOpcionalId: typeId || OPTIONAL_TYPE_IDS.MEDICAMENTOS
});

/**
 * Crea un opcional de copago
 */
export const createCopagoOptional = (
  copagoData: Copago,
  multiplicador: number,
  typeId: number
): Opcional => ({
  id: copagoData.id,
  idCopago: copagoData.id,
  nombre: `COPAGO ${getOptionalNameByType(typeId)}`,
  descripcion: copagoData.descripcion,
  prima: copagoData.price * multiplicador,
  tipoOpcionalId: typeId
});

/**
 * Crea un opcional estático (para individuales)
 */
export const createStaticOptional = (
  id: number,
  name: string,
  description: string,
  price: number,
  multiplicador: number,
  typeId: number
): Opcional => ({
  id,
  nombre: name,
  descripcion: description,
  prima: price * multiplicador,
  tipoOpcionalId: typeId
});

/**
 * Obtiene el nombre del opcional por tipo
 */
function getOptionalNameByType(typeId: number): string {
  switch (typeId) {
    case OPTIONAL_TYPE_IDS.MEDICAMENTOS: return 'MEDICAMENTOS';
    case OPTIONAL_TYPE_IDS.HABITACION: return 'HABITACION';
    case OPTIONAL_TYPE_IDS.ALTO_COSTO: return 'ALTO COSTO';
    case OPTIONAL_TYPE_IDS.ODONTOLOGIA: return 'ODONTOLOGIA';
    default: return 'OPCIONAL';
  }
}

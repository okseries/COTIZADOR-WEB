/**
 * Hook para la lógica de actualización de opcionales en el store
 * Versión simplificada y optimizada
 */

import { useCallback } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { 
  createCoverageOptional, 
  createCopagoOptional, 
  createStaticOptional 
} from '../../utils/optional.helpers';
import { OPTIONAL_TYPE_IDS } from '../../constants/coverage.constants';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { 
  CoberturasOpcionaleColectivo, 
  Copago 
} from '../../interface/Coberturaopcional.interface';
import { 
  GlobalFilters, 
  DynamicCoberturaSelections, 
  DynamicCopagoSelectionsMap,
  PlanesData 
} from '../../types/coverage.types';
import { Cliente, Plan } from '@/core/types/quotation';
import { OdontologiaOption } from '../components/OdontologiaSelect';

interface StoreUpdaterState {
  isUpdating: boolean;
  planesData: PlanesData;
  planes: Plan[];
  isCollective: boolean;
  cliente: Cliente | null;
  globalFilters: GlobalFilters;
  dynamicCoberturaSelections: DynamicCoberturaSelections;
  dynamicCopagoSelections: DynamicCopagoSelectionsMap;
}

interface StoreUpdaterQueries {
  altoCostoOptions?: CoberturasOpcionaleColectivo[];
  medicamentosOptions?: CoberturasOpcionaleColectivo[];
  habitacionOptions?: CoberturasOpcionaleColectivo[];
  odontologiaOptions?: OdontologiaOption[];
  copagosOptions?: Copago[];
  copagosAltoCostoOptions?: Copago[];
  copagosHabitacionOptions?: Copago[];
}

export const useStoreUpdater = (state: StoreUpdaterState, queries: StoreUpdaterQueries) => {
  const { updatePlanByName } = useUnifiedQuotationStore();

  const updatePlanOpcionales = useCallback((planName: string, odontologiaValue: string) => {
    if (state.isUpdating) return;
    
    const planDataCurrent = state.planesData[planName];
    if (!planDataCurrent?.[0]) return;

    const plan = state.planes.find((p: Plan) => p.plan === planName);
    if (!plan) return;

    const opcionales: Opcional[] = [];
    const data = planDataCurrent[0];
    let subTotalOpcional = 0;

    // Calcular multiplicador
    const cantidadAfiliados = state.isCollective 
      ? (plan.cantidadAfiliados || 1)
      : plan.afiliados.length;

    // Obtener selecciones actuales
    const currentDynamicSelections = state.dynamicCoberturaSelections[planName] || {};
    const currentDynamicCopagos = state.dynamicCopagoSelections[planName] || {};

    // Procesar Alto Costo
    if (state.cliente?.clientChoosen === 1 || (state.isCollective && state.globalFilters.altoCosto)) {
      if (state.isCollective && currentDynamicSelections.altoCosto && currentDynamicSelections.altoCosto !== "0") {
        const selectedOption = queries.altoCostoOptions?.find((opt: CoberturasOpcionaleColectivo) => 
          opt.opt_id.toString() === currentDynamicSelections.altoCosto
        );
        
        if (selectedOption) {
          const cobertura = createCoverageOptional(
            selectedOption, 
            cantidadAfiliados, 
            currentDynamicCopagos.altoCosto,
            OPTIONAL_TYPE_IDS.ALTO_COSTO
          );
          opcionales.push(cobertura);
          subTotalOpcional += cobertura.prima;

          // Agregar copago si existe
          if (currentDynamicCopagos.altoCosto && currentDynamicCopagos.altoCosto !== "0") {
            const copagoOpt = queries.copagosAltoCostoOptions?.find((opt: Copago) => 
              opt.id.toString() === currentDynamicCopagos.altoCosto
            );
            
            if (copagoOpt) {
              const copago = createCopagoOptional(copagoOpt, cantidadAfiliados, OPTIONAL_TYPE_IDS.ALTO_COSTO);
              opcionales.push(copago);
              subTotalOpcional += copago.prima;
            }
          }
        }
      } else if (!state.isCollective) {
        // Para individuales, usar valor estático
        const prima = parseFloat(data.primaCosto) || 0;
        const opcional = createStaticOptional(
          2, 
          "ALTO COSTO", 
          data.altoCosto, 
          prima, 
          cantidadAfiliados, 
          OPTIONAL_TYPE_IDS.ALTO_COSTO
        );
        opcionales.push(opcional);
        subTotalOpcional += opcional.prima;
      }
    }

    // Procesar Medicamentos (similar estructura)
    if (state.cliente?.clientChoosen === 1 || (state.isCollective && state.globalFilters.medicamentos)) {
      if (state.isCollective && currentDynamicSelections.medicamentos && currentDynamicSelections.medicamentos !== "0") {
        const selectedOption = queries.medicamentosOptions?.find((opt: CoberturasOpcionaleColectivo) => 
          opt.opt_id.toString() === currentDynamicSelections.medicamentos
        );
        
        if (selectedOption) {
          const cobertura = createCoverageOptional(
            selectedOption, 
            cantidadAfiliados, 
            currentDynamicCopagos.medicamentos,
            OPTIONAL_TYPE_IDS.MEDICAMENTOS
          );
          opcionales.push(cobertura);
          subTotalOpcional += cobertura.prima;

          if (currentDynamicCopagos.medicamentos && currentDynamicCopagos.medicamentos !== "0") {
            const copagoOpt = queries.copagosOptions?.find((opt: Copago) => 
              opt.id.toString() === currentDynamicCopagos.medicamentos
            );
            
            if (copagoOpt) {
              const copago = createCopagoOptional(copagoOpt, cantidadAfiliados, OPTIONAL_TYPE_IDS.MEDICAMENTOS);
              opcionales.push(copago);
              subTotalOpcional += copago.prima;
            }
          }
        }
      } else if (!state.isCollective) {
        const prima = parseFloat(data.medicamentoCosto) || 0;
        const opcional = createStaticOptional(
          1, 
          "MEDICAMENTOS", 
          data.medicamento, 
          prima, 
          cantidadAfiliados, 
          OPTIONAL_TYPE_IDS.MEDICAMENTOS
        );
        opcionales.push(opcional);
        subTotalOpcional += opcional.prima;
      }
    }

    // Procesar Habitación (similar estructura)
    if (state.cliente?.clientChoosen === 1 || (state.isCollective && state.globalFilters.habitacion)) {
      if (state.isCollective && currentDynamicSelections.habitacion && currentDynamicSelections.habitacion !== "0") {
        const selectedOption = queries.habitacionOptions?.find((opt: CoberturasOpcionaleColectivo) => 
          opt.opt_id.toString() === currentDynamicSelections.habitacion
        );
        
        if (selectedOption) {
          const cobertura = createCoverageOptional(
            selectedOption, 
            cantidadAfiliados, 
            currentDynamicCopagos.habitacion,
            OPTIONAL_TYPE_IDS.HABITACION
          );
          opcionales.push(cobertura);
          subTotalOpcional += cobertura.prima;

          if (currentDynamicCopagos.habitacion && currentDynamicCopagos.habitacion !== "0") {
            const copagoOpt = queries.copagosHabitacionOptions?.find((opt: Copago) => 
              opt.id.toString() === currentDynamicCopagos.habitacion
            );
            
            if (copagoOpt) {
              const copago = createCopagoOptional(copagoOpt, cantidadAfiliados, OPTIONAL_TYPE_IDS.HABITACION);
              opcionales.push(copago);
              subTotalOpcional += copago.prima;
            }
          }
        }
      } else if (!state.isCollective) {
        const prima = parseFloat(data.habitacionCosto) || 0;
        const opcional = createStaticOptional(
          3, 
          "HABITACION", 
          data.habitacion, 
          prima, 
          cantidadAfiliados, 
          OPTIONAL_TYPE_IDS.HABITACION
        );
        opcionales.push(opcional);
        subTotalOpcional += opcional.prima;
      }
    }

    // Procesar Odontología
    if (odontologiaValue !== "0") {
      const odontologiaOption = queries.odontologiaOptions?.find((opt: OdontologiaOption) => 
        opt.value === odontologiaValue
      );
      
      if (odontologiaOption) {
        const opcional = createStaticOptional(
          4, 
          "ODONTOLOGIA", 
          odontologiaOption.label, 
          odontologiaOption.prima, 
          cantidadAfiliados,
          OPTIONAL_TYPE_IDS.ODONTOLOGIA
        );
        opcionales.push(opcional);
        subTotalOpcional += opcional.prima;
      }
    }

    // Calcular subtotal de afiliados - obteniendo del plan actual en el store
    const currentPlan = state.planes.find((p: Plan) => p.plan === planName);
    const subTotalAfiliado = currentPlan?.resumenPago?.subTotalAfiliado || 0;

    // Actualizar el plan en el store
    updatePlanByName(planName, {
      opcionales,
      resumenPago: {
        subTotalAfiliado,
        subTotalOpcional,
        periodoPago: plan.resumenPago?.periodoPago || 'MENSUAL',
        totalPagar: subTotalAfiliado + subTotalOpcional
      }
    });

  }, [
    state.isUpdating, 
    state.planesData, 
    state.planes, 
    state.isCollective, 
    state.cliente, 
    state.globalFilters,
    state.dynamicCoberturaSelections,
    state.dynamicCopagoSelections,
    queries.altoCostoOptions,
    queries.medicamentosOptions,
    queries.habitacionOptions,
    queries.odontologiaOptions,
    queries.copagosOptions,
    queries.copagosAltoCostoOptions,
    queries.copagosHabitacionOptions,
    updatePlanByName
  ]);

  return { updatePlanOpcionales };
};

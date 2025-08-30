/**
 * Hook especializado para actualización de planes con coberturas opcionales
 * Contiene toda la lógica crítica de mapeo y cálculo de primas
 */

import { useCallback } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { CoberturasOpcional, CoberturasOpcionaleColectivo, Copago } from '../../interface/Coberturaopcional.interface';
import { ODONTOLOGIA_OPTIONS } from '../../constants/coverage.constants';
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface';
import { Cliente } from '@/presentation/quotations/interface/quotation.interface';
import { UseQueryResult } from '@tanstack/react-query';
import { 
  DynamicCoberturaSelections, 
  DynamicCopagoSelectionsMap,
  GlobalFilters,
  PlanSelections,
  PlanesData,
  CoberturaSelections
} from '../../types/coverage.types';

interface UsePlanUpdaterProps {
  cliente: Cliente | null;
  planes: Plan[];
  planesData: PlanesData;
  globalFilters: GlobalFilters;
  dynamicCoberturaSelections: DynamicCoberturaSelections;
  dynamicCopagoSelections: DynamicCopagoSelectionsMap;
  planSelections: PlanSelections;
  coberturaSelections: {[planName: string]: CoberturaSelections};
  altoCostoOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  medicamentosOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  habitacionOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  copagosQuery: UseQueryResult<Copago[], unknown>;
  copagosAltoCostoQuery: UseQueryResult<Copago[], unknown>;
  copagosHabitacionQuery: UseQueryResult<Copago[], unknown>;
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
}

export const usePlanUpdater = ({
  cliente,
  planes,
  planesData,
  globalFilters,
  dynamicCoberturaSelections,
  dynamicCopagoSelections,
  planSelections,
  coberturaSelections,
  altoCostoOptionsQuery,
  medicamentosOptionsQuery,
  habitacionOptionsQuery,
  copagosQuery,
  copagosAltoCostoQuery,
  copagosHabitacionQuery,
  isUpdating,
  setIsUpdating
}: UsePlanUpdaterProps) => {
  const { updatePlanByName } = useUnifiedQuotationStore();

  const updatePlanOpcionales = useCallback((planName: string, odontologiaValue: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Obtener planesData actual del estado
    const planDataCurrent = planesData[planName];
    if (!planDataCurrent || !planDataCurrent[0]) {
      setIsUpdating(false);
      return;
    }

    const opcionales: any[] = [];
    const data = planDataCurrent[0];
    const plan = planes.find(p => p.plan === planName);
    if (!plan) {
      setIsUpdating(false);
      return;
    }

    let subTotalOpcional = 0;
    // Para colectivos: usar plan.cantidadAfiliados
    // Para individuales: usar plan.afiliados.length (cantidad real de afiliados en la familia)
    const cantidadAfiliados = cliente?.clientChoosen === 2 
      ? (plan.cantidadAfiliados || 1)
      : plan.afiliados.length;

    // 🚨 FIX CRÍTICO: Multiplicador para cálculos debe ser cantidadAfiliados para AMBOS tipos
    // Para individuales también debe multiplicar por la cantidad de afiliados
    const multiplicadorPrima = cantidadAfiliados;

    // Obtener las selecciones dinámicas actuales para este plan específico
    const currentDynamicSelections = dynamicCoberturaSelections[planName] || {};
    const currentDynamicCopagos = dynamicCopagoSelections[planName] || { altoCosto: '', medicamentos: '', habitacion: '' };

    // Para clientChoosen === 1 (individuales): incluir automáticamente todas las opcionales básicas
    // Para clientChoosen === 2 (colectivos): solo incluir las que están marcadas en los filtros
    if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.altoCosto)) {
      if (cliente?.clientChoosen === 2 && currentDynamicSelections.altoCosto && currentDynamicSelections.altoCosto !== "0") {
        // Para colectivos, usar la selección específica del dropdown dinámico
        const selectedOption = altoCostoOptionsQuery.data?.find(opt => opt.opt_id.toString() === currentDynamicSelections.altoCosto);
        if (selectedOption) {
          const primaBase = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
          
          // 🆕 ESTRATEGIA CORREGIDA: SIEMPRE usar opt_id del catálogo
          // El backend hará el re-mapeo interno, nosotros solo enviamos intenciones
          const finalId = selectedOption.opt_id; // ✅ SIEMPRE opt_id del catálogo
          
          // Agregar la cobertura base
          opcionales.push({
            id: finalId, // ✅ opt_id del catálogo (intención del usuario)
            originalOptId: selectedOption.opt_id, // 🆕 Persistir ID original para mapeo futuro
            idCopago: currentDynamicCopagos.altoCosto ? parseInt(currentDynamicCopagos.altoCosto) : undefined,
            nombre: "ALTO COSTO",
            descripcion: selectedOption.descripcion,
            prima: primaBase, // Prima base de la cobertura
            tipoOpcionalId: 3 // 🆕 ID del tipo de opcional para Alto Costo
          });
          subTotalOpcional += primaBase;
          
          // Si hay copago seleccionado, agregarlo como costo adicional
          if (currentDynamicCopagos.altoCosto && currentDynamicCopagos.altoCosto !== "0") {
            const copagoOpt = copagosAltoCostoQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.altoCosto);
            if (copagoOpt) {
              const primaCopago = copagoOpt.price * multiplicadorPrima;
              opcionales.push({
                id: copagoOpt.id, // ✅ ID del copago (no hardcodeado)
                idCopago: parseInt(currentDynamicCopagos.altoCosto),
                nombre: "COPAGO ALTO COSTO",
                descripcion: copagoOpt.descripcion,
                prima: primaCopago, // El copago se suma al total
                tipoOpcionalId: 3 // 🆕 ID del tipo de opcional para Alto Costo
              });
              subTotalOpcional += primaCopago;
            }
          }
        }
      } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.altoCosto) {
        // Ya no hay fallback estático - solo datos dinámicos
      } else {
        // Para individuales, usar el valor estático original MULTIPLICANDO por cantidad de afiliados
        const prima = parseFloat(data.primaCosto) || 0;
        const primaCalculada = prima * multiplicadorPrima;
        opcionales.push({
          id: 2, // ID para Alto Costo
          nombre: "ALTO COSTO",
          descripcion: data.altoCosto,
          prima: primaCalculada,
          tipoOpcionalId: 3 // 🆕 ID del tipo de opcional para Alto Costo
        });
        subTotalOpcional += primaCalculada;
      }
    }

    if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.medicamentos)) {
      if (cliente?.clientChoosen === 2 && currentDynamicSelections.medicamentos && currentDynamicSelections.medicamentos !== "0") {
        // Para colectivos, usar la selección específica del dropdown dinámico
        const selectedOption = medicamentosOptionsQuery.data?.find(opt => opt.opt_id.toString() === currentDynamicSelections.medicamentos);
        if (selectedOption) {
          const primaBase = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;

          // 🆕 ESTRATEGIA CORREGIDA: SIEMPRE usar opt_id del catálogo
          // El backend hará el re-mapeo interno, nosotros solo enviamos intenciones
          const finalId = selectedOption.opt_id; // ✅ SIEMPRE opt_id del catálogo

          // Agregar la cobertura base
          opcionales.push({
            id: finalId, // ✅ opt_id del catálogo (intención del usuario)
            originalOptId: selectedOption.opt_id, // 🆕 Persistir ID original para mapeo futuro
            idCopago: currentDynamicCopagos.medicamentos ? parseInt(currentDynamicCopagos.medicamentos) : undefined,
            nombre: "MEDICAMENTOS",
            descripcion: selectedOption.descripcion,
            prima: primaBase, // Prima base de la cobertura
            tipoOpcionalId: 1 // 🆕 ID del tipo de opcional para Medicamentos
          });
          subTotalOpcional += primaBase;

          // Si hay copago seleccionado, agregarlo como costo adicional
          if (currentDynamicCopagos.medicamentos && currentDynamicCopagos.medicamentos !== "0") {
            const copagoOpt = copagosQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.medicamentos);
            if (copagoOpt) {
              const primaCopago = copagoOpt.price * multiplicadorPrima;
              opcionales.push({
                id: copagoOpt.id, // ✅ ID del copago (no hardcodeado)
                idCopago: parseInt(currentDynamicCopagos.medicamentos),
                nombre: "COPAGO MEDICAMENTOS",
                descripcion: copagoOpt.descripcion,
                prima: primaCopago, // El copago se suma al total
                tipoOpcionalId: 1 // 🆕 ID del tipo de opcional para Medicamentos
              });
              subTotalOpcional += primaCopago;
            }
          }
        }
      } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.medicamentos) {
        // Ya no hay fallback estático - solo datos dinámicos
      } else {
        // Para individuales, usar el valor estático original MULTIPLICANDO por cantidad de afiliados
        const prima = parseFloat(data.medicamentoCosto) || 0;
        const primaCalculada = prima * multiplicadorPrima;
        opcionales.push({
          id: 1, // ID para Medicamentos
          nombre: "MEDICAMENTOS",
          descripcion: data.medicamento,
          prima: primaCalculada,
          tipoOpcionalId: 1 // 🆕 ID del tipo de opcional para Medicamentos
        });
        subTotalOpcional += primaCalculada;
      }
    }

    // 🆕 FIX CRÍTICO: Para colectivos, considerar tanto filtro global como selecciones dinámicas activas
    const hasHabitacionSelected = cliente?.clientChoosen === 2 && 
                                 currentDynamicSelections.habitacion && 
                                 currentDynamicSelections.habitacion !== "0";
    
    if (cliente?.clientChoosen === 1 || 
        (cliente?.clientChoosen === 2 && globalFilters.habitacion) ||
        hasHabitacionSelected) {
      if (cliente?.clientChoosen === 2 && currentDynamicSelections.habitacion && currentDynamicSelections.habitacion !== "0") {
        // Para colectivos, usar la selección específica del dropdown dinámico
        const selectedOption = habitacionOptionsQuery.data?.find(opt => opt.opt_id.toString() === currentDynamicSelections.habitacion);
        if (selectedOption) {
          const primaBase = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
          
          // 🆕 ESTRATEGIA CORREGIDA: SIEMPRE usar opt_id del catálogo
          // El backend hará el re-mapeo interno, nosotros solo enviamos intenciones
          const finalId = selectedOption.opt_id; // ✅ SIEMPRE opt_id del catálogo
          
          // Agregar la cobertura base
          opcionales.push({
            id: finalId, // ✅ opt_id del catálogo (intención del usuario)
            originalOptId: selectedOption.opt_id, // 🆕 Persistir ID original para mapeo futuro
            idCopago: currentDynamicCopagos.habitacion ? parseInt(currentDynamicCopagos.habitacion) : undefined,
            nombre: "HABITACION",
            descripcion: selectedOption.descripcion,
            prima: primaBase, // Prima base de la cobertura
            tipoOpcionalId: 2 // 🆕 ID del tipo de opcional para Habitación
          });
          subTotalOpcional += primaBase;
          
          // Si hay copago seleccionado, agregarlo como costo adicional
          if (currentDynamicCopagos.habitacion && currentDynamicCopagos.habitacion !== "0") {
            const copagoOpt = copagosHabitacionQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.habitacion);
            if (copagoOpt) {
              const primaCopago = copagoOpt.price * multiplicadorPrima;
              opcionales.push({
                id: copagoOpt.id, // ✅ ID del copago (no hardcodeado)
                idCopago: parseInt(currentDynamicCopagos.habitacion),
                nombre: "COPAGO HABITACIÓN",
                descripcion: copagoOpt.descripcion,
                prima: primaCopago, // El copago se suma al total
                tipoOpcionalId: 2 // 🆕 ID del tipo de opcional para Habitación
              });
              subTotalOpcional += primaCopago;
            }
          }
        }
      } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.habitacion) {
        // Ya no hay fallback estático - solo datos dinámicos
      } else {
        // Para individuales, usar el valor estático original MULTIPLICANDO por cantidad de afiliados
        const prima = parseFloat(data.habitacionCosto) || 0;
        const primaCalculada = prima * multiplicadorPrima;
        opcionales.push({
          id: 3, // ID para Habitación
          nombre: "HABITACION",
          descripcion: data.habitacion,
          prima: primaCalculada,
          tipoOpcionalId: 2 // 🆕 ID del tipo de opcional para Habitación
        });
        subTotalOpcional += primaCalculada;
      }
    }

    // Odontología - es opcional para ambos tipos de cliente
    const odontologiaSelected = ODONTOLOGIA_OPTIONS.find(opt => opt.value === odontologiaValue);
    
    if (odontologiaSelected && odontologiaSelected.value !== "0") {
      // NUEVA LÓGICA SIMPLIFICADA: 
      // Para individuales: incluir si se selecciona explícitamente
      // Para colectivos: incluir SOLO si el filtro global está activado Y se selecciona valor
      const shouldIncludeOdontologia = 
        cliente?.clientChoosen === 1 || 
        (cliente?.clientChoosen === 2 && globalFilters.odontologia && odontologiaValue !== "0");
      
      if (shouldIncludeOdontologia) {
        const primaCalculada = odontologiaSelected.prima * multiplicadorPrima;

        opcionales.push({
          id: 4, // ID para Odontología
          nombre: "ODONTOLOGIA",
          descripcion: odontologiaSelected.label,
          prima: primaCalculada,
          tipoOpcionalId: 4 // 🆕 ID del tipo de opcional para Odontología
        });
        subTotalOpcional += primaCalculada;
      } 
    } 

    // Actualizar el plan en el store
    const currentPlan = planes.find(p => p.plan === planName);
    if (currentPlan) {
      const subTotalAfiliado = currentPlan.resumenPago.subTotalAfiliado;
      
      updatePlanByName(planName, {
        opcionales,
        resumenPago: {
          ...currentPlan.resumenPago,
          subTotalOpcional,
          totalPagar: subTotalAfiliado + subTotalOpcional
        }
      });
    } 
    
    setIsUpdating(false);
  }, [
    planesData, 
    planes, 
    cliente, 
    globalFilters, 
    dynamicCoberturaSelections, 
    dynamicCopagoSelections,
    altoCostoOptionsQuery.data,
    medicamentosOptionsQuery.data,
    habitacionOptionsQuery.data,
    copagosQuery.data,
    copagosAltoCostoQuery.data,
    copagosHabitacionQuery.data,
    updatePlanByName,
    coberturaSelections,
    planSelections,
    isUpdating,
    setIsUpdating
  ]);

  return {
    updatePlanOpcionales
  };
};

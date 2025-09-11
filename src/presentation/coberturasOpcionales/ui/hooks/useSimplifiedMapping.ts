/**
 * Hook simplificado para mapear datos del store a selecciones de UI
 * Soluciona el problema de navegación entre steps donde los selects no reflejan los datos guardados
 */

import { useEffect, useState, useCallback } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { ODONTOLOGIA_OPTIONS } from '../../constants/coverage.constants';

interface MappedSelections {
  dynamicCoberturaSelections: {[planName: string]: {
    altoCosto: string;
    medicamentos: string;
    habitacion: string;
    odontologia: string;
  }};
  dynamicCopagoSelections: {[planName: string]: {
    altoCosto: string;
    medicamentos: string;
    habitacion: string;
  }};
  planSelections: {[planName: string]: {[key: string]: string}};
}

export const useSimplifiedMapping = () => {
  const { planes, mode } = useUnifiedQuotationStore();
  const isEditMode = mode !== "create";
  
  const [mappedData, setMappedData] = useState<MappedSelections>({
    dynamicCoberturaSelections: {},
    dynamicCopagoSelections: {},
    planSelections: {}
  });

  // 🛡️ Flag para evitar bucles infinitos
  const [hasMapped, setHasMapped] = useState(false);

  // Función para mapear un plan individual
  const mapPlanData = useCallback((plan: any) => {
    const selections = {
      altoCosto: "0",
      medicamentos: "0",
      habitacion: "0",
      odontologia: "0"
    };

    const copagoSelections = {
      altoCosto: "0",
      medicamentos: "0",
      habitacion: "0"
    };

    const planSelections = {
      odontologia: "0"
    };

    // Mapear opcionales existentes
    if (plan.opcionales && plan.opcionales.length > 0) {
      plan.opcionales.forEach((opcional: any) => {
        switch (opcional.nombre) {
          case "ALTO COSTO":
            // Usar originalOptId si existe, sino usar id
            const altoCostoId = opcional.originalOptId || opcional.id;
            if (altoCostoId) {
              selections.altoCosto = altoCostoId.toString();
            }
            break;

          case "COPAGO ALTO COSTO":
            if (opcional.idCopago) {
              copagoSelections.altoCosto = opcional.idCopago.toString();
            }
            break;

          case "MEDICAMENTOS":
            // Usar originalOptId si existe, sino usar id
            const medicamentosId = opcional.originalOptId || opcional.id;
            if (medicamentosId) {
              selections.medicamentos = medicamentosId.toString();
            }
            break;

          case "COPAGO MEDICAMENTOS":
            if (opcional.idCopago) {
              copagoSelections.medicamentos = opcional.idCopago.toString();
            }
            break;

          case "HABITACION":
            // Usar originalOptId si existe, sino usar id
            const habitacionId = opcional.originalOptId || opcional.id;
            if (habitacionId) {
              selections.habitacion = habitacionId.toString();
            }
            break;

          case "COPAGO HABITACIÓN":
            if (opcional.idCopago) {
              copagoSelections.habitacion = opcional.idCopago.toString();
            }
            break;

          case "ODONTOLOGIA":
          case "ODONTOLOGÍA":
            if (opcional.prima && plan.cantidadAfiliados) {
              const primaUnitaria = opcional.prima / plan.cantidadAfiliados;
              const matchingOption = ODONTOLOGIA_OPTIONS.find(opt => 
                Math.abs(opt.prima - primaUnitaria) < 1
              );
              
              if (matchingOption) {
                planSelections.odontologia = matchingOption.value;
                selections.odontologia = matchingOption.value;
              }
            }
            break;
        }
      });
    }

    return {
      selections,
      copagoSelections,
      planSelections
    };
  }, []);

  // Función principal para mapear todos los planes
  const mapAllPlans = useCallback(() => {
    if (!planes || planes.length === 0) {
      return {
        dynamicCoberturaSelections: {},
        dynamicCopagoSelections: {},
        planSelections: {}
      };
    }

    const newDynamicCoberturaSelections: {[planName: string]: any} = {};
    const newDynamicCopagoSelections: {[planName: string]: any} = {};
    const newPlanSelections: {[planName: string]: any} = {};

    planes.forEach(plan => {
      const mapped = mapPlanData(plan);
      
      newDynamicCoberturaSelections[plan.plan] = mapped.selections;
      newDynamicCopagoSelections[plan.plan] = mapped.copagoSelections;
      newPlanSelections[plan.plan] = mapped.planSelections;
    });

    return {
      dynamicCoberturaSelections: newDynamicCoberturaSelections,
      dynamicCopagoSelections: newDynamicCopagoSelections,
      planSelections: newPlanSelections
    };
  }, [planes, mapPlanData]);

  // Efecto para actualizar las selecciones cuando cambien los planes - SOLO UNA VEZ
  useEffect(() => {
    if (isEditMode && planes && planes.length > 0 && !hasMapped) {
      const newMappedData = mapAllPlans();
      setMappedData(newMappedData);
      setHasMapped(true); // Marcar como mapeado para evitar bucles
      
      // 🔍 DEBUG: Ver qué se está mapeando
      console.log('🔄 Simplified mapping result (ONE TIME):', {
        planesCount: planes.length,
        mappedPlans: Object.keys(newMappedData.dynamicCoberturaSelections),
        sampledPlan: planes[0]?.plan,
        sampledSelections: newMappedData.dynamicCoberturaSelections[planes[0]?.plan],
        sampledCopagos: newMappedData.dynamicCopagoSelections[planes[0]?.plan]
      });
    }
  }, [isEditMode, planes?.length, hasMapped, mapAllPlans]);

  // Resetear el flag cuando cambie el modo o no haya planes
  useEffect(() => {
    if (!isEditMode || !planes || planes.length === 0) {
      setHasMapped(false);
    }
  }, [isEditMode, planes?.length]);

  // Función para obtener selecciones actualizadas cuando sea necesario
  const getUpdatedSelections = useCallback(() => {
    if (isEditMode && planes && planes.length > 0) {
      return mapAllPlans();
    }
    return mappedData;
  }, [isEditMode, planes, mapAllPlans, mappedData]);

  // Función para forzar remapeo (útil cuando los copagos no cargan correctamente)
  const forceRemapping = useCallback(() => {
    if (planes && planes.length > 0) {
      console.log('🔄 Forcing remapping due to copago issues - CONTROLLED');
      const newMappedData = mapAllPlans();
      setMappedData(newMappedData);
      // No resetear hasMapped aquí para evitar bucles infinitos
      return newMappedData;
    }
    return mappedData;
  }, [planes, mapAllPlans, mappedData]);

  return {
    mappedData,
    getUpdatedSelections,
    forceRemapping,
    hasMapped,
    isReady: isEditMode ? planes.length > 0 && hasMapped : true
  };
};


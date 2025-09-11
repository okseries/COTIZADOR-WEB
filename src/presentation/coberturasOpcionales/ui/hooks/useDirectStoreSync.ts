/**
 * Hook DEFINITIVO para resolver el problema de navegación Step 3
 * Enfoque: Sincronización directa store -> UI en tiempo real
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { ODONTOLOGIA_OPTIONS } from '../../constants/coverage.constants';

// Tipos simplificados
interface UISelections {
  [planName: string]: {
    // Coberturas dinámicas
    altoCosto: string;
    medicamentos: string;
    habitacion: string;
    odontologia: string;
    // Copagos
    copagoAltoCosto: string;
    copagoMedicamentos: string;
    copagoHabitacion: string;
  }
}

export const useDirectStoreSync = () => {
  const { planes, mode } = useUnifiedQuotationStore();
  const isEditMode = mode !== "create";
  
  // Estado UI unificado - una sola fuente de verdad
  const [uiSelections, setUISelections] = useState<UISelections>({});
  
  // Flag para controlar sincronización inicial
  const [hasSynced, setHasSynced] = useState(false);

  // Función para extraer selecciones DIRECTAMENTE del store
  const extractSelectionsFromStore = useCallback(() => {
    if (!planes || planes.length === 0) return {};

    const selections: UISelections = {};

    planes.forEach(plan => {
      selections[plan.plan] = {
        altoCosto: "0",
        medicamentos: "0", 
        habitacion: "0",
        odontologia: "0",
        copagoAltoCosto: "0",
        copagoMedicamentos: "0",
        copagoHabitacion: "0"
      };

      // Extraer directamente de plan.opcionales (sin mapeos complejos)
      if (plan.opcionales && plan.opcionales.length > 0) {
        plan.opcionales.forEach(opcional => {
          const planSelections = selections[plan.plan];

          switch (opcional.nombre) {
            case "ALTO COSTO":
              if (opcional.originalOptId) {
                planSelections.altoCosto = opcional.originalOptId.toString();
              } else if (opcional.id) {
                planSelections.altoCosto = opcional.id.toString();
              }
              break;

            case "COPAGO ALTO COSTO":
              if (opcional.idCopago) {
                planSelections.copagoAltoCosto = opcional.idCopago.toString();
              }
              break;

            case "MEDICAMENTOS":
              if (opcional.originalOptId) {
                planSelections.medicamentos = opcional.originalOptId.toString();
              } else if (opcional.id) {
                planSelections.medicamentos = opcional.id.toString();
              }
              break;

            case "COPAGO MEDICAMENTOS":
              if (opcional.idCopago) {
                planSelections.copagoMedicamentos = opcional.idCopago.toString();
              }
              break;

            case "HABITACION":
              if (opcional.originalOptId) {
                planSelections.habitacion = opcional.originalOptId.toString();
              } else if (opcional.id) {
                planSelections.habitacion = opcional.id.toString();
              }
              break;

            case "COPAGO HABITACIÓN":
              if (opcional.idCopago) {
                planSelections.copagoHabitacion = opcional.idCopago.toString();
              }
              break;

            case "ODONTOLOGIA":
            case "ODONTOLOGÍA":
              if (opcional.prima && plan.cantidadAfiliados) {
                const primaUnitaria = opcional.prima / plan.cantidadAfiliados;
                const match = ODONTOLOGIA_OPTIONS.find(opt => 
                  Math.abs(opt.prima - primaUnitaria) < 1
                );
                if (match) {
                  planSelections.odontologia = match.value;
                }
              }
              break;
          }
        });
      }
    });

    return selections;
  }, [planes]);

  // Sincronización DIRECTA store -> UI (solo una vez por edición)
  useEffect(() => {
    if (isEditMode && planes.length > 0 && !hasSynced) {
      console.log('🔄 Direct sync: Store -> UI (ONE TIME)', {
        planesCount: planes.length,
        mode: mode
      });

      const storeSelections = extractSelectionsFromStore();
      setUISelections(storeSelections);
      setHasSynced(true);
    }
  }, [isEditMode, planes.length, hasSynced, extractSelectionsFromStore, mode]);

  // Reset al cambiar contexto
  useEffect(() => {
    if (!isEditMode || planes.length === 0) {
      setHasSynced(false);
      setUISelections({});
    }
  }, [isEditMode, planes.length]);

  // Convertir a formato esperado por los hooks existentes
  const legacyFormat = useMemo(() => {
    const dynamicCoberturaSelections: {[planName: string]: any} = {};
    const dynamicCopagoSelections: {[planName: string]: any} = {};
    const planSelections: {[planName: string]: any} = {};

    Object.keys(uiSelections).forEach(planName => {
      const selections = uiSelections[planName];
      
      dynamicCoberturaSelections[planName] = {
        altoCosto: selections.altoCosto,
        medicamentos: selections.medicamentos,
        habitacion: selections.habitacion,
        odontologia: selections.odontologia
      };

      dynamicCopagoSelections[planName] = {
        altoCosto: selections.copagoAltoCosto,
        medicamentos: selections.copagoMedicamentos,
        habitacion: selections.copagoHabitacion
      };

      planSelections[planName] = {
        odontologia: selections.odontologia
      };
    });

    return {
      dynamicCoberturaSelections,
      dynamicCopagoSelections,
      planSelections
    };
  }, [uiSelections]);

  // Función para actualizar una selección
  const updateSelection = useCallback((planName: string, field: keyof UISelections[string], value: string) => {
    setUISelections(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [field]: value
      }
    }));
  }, []);

  return {
    // Datos en formato legacy para compatibilidad
    ...legacyFormat,
    
    // Nuevas funciones
    uiSelections,
    updateSelection,
    hasSynced,
    isReady: isEditMode ? hasSynced : true,
    
    // Debug
    planesInStore: planes.length,
    storeData: planes
  };
};

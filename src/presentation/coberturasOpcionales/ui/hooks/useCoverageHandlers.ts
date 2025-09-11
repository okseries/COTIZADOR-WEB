/**
 * Hook especializado para manejar los handlers de cambios en las coberturas
 */

import { useCallback } from 'react';
import { Plan, Cliente } from '@/presentation/quotations/interface/createQuotation.interface';
import { 
  PlanSelections,
  DynamicCoberturaSelections,
  DynamicCopagoSelectionsMap
} from '../../types/coverage.types';

interface UseCoverageHandlersProps {
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
  cliente: Cliente | null;
  planes: Plan[];
  planSelections: PlanSelections;
  updatePlanOpcionales: (planName: string, odontologiaValue: string) => void;
  setPlanSelections: React.Dispatch<React.SetStateAction<PlanSelections>>;
  setDynamicCoberturaSelections: React.Dispatch<React.SetStateAction<DynamicCoberturaSelections>>;
  setDynamicCopagoSelections: React.Dispatch<React.SetStateAction<DynamicCopagoSelectionsMap>>;
  navigationLoadedRef: React.MutableRefObject<boolean>;
}

export const useCoverageHandlers = ({
  isUpdating,
  cliente,
  planes,
  planSelections,
  updatePlanOpcionales,
  setPlanSelections,
  setDynamicCoberturaSelections,
  setDynamicCopagoSelections,
  navigationLoadedRef
}: UseCoverageHandlersProps) => {

  const handleOdontologiaChange = useCallback((planName: string, value: string) => {
    if (isUpdating) return;
    
    // 🆕 RESETEAR FLAG DE NAVEGACIÓN cuando el usuario hace cambios manuales
    navigationLoadedRef.current = false;
    
    setPlanSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // Para colectivos, solo actualizar el plan específico
        newSelections[planName] = {
          ...newSelections[planName],
          odontologia: value
        };
      } else {
        // Para individuales, actualizar todos los planes con el mismo valor
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            odontologia: value
          };
        });
      }
      
      return newSelections;
    });
    
    // Actualizar inmediatamente para reflejar cambios
    if (cliente?.clientChoosen === 2) {
      updatePlanOpcionales(planName, value);
    } else {
      // Para individuales, actualizar todos los planes
      planes.forEach(plan => {
        updatePlanOpcionales(plan.plan, value);
      });
    }
  }, [
    isUpdating,
    cliente?.clientChoosen,
    planes,
    updatePlanOpcionales,
    setPlanSelections,
    navigationLoadedRef
  ]);

  const handleDynamicCoberturaChange = useCallback((
    planName: string, 
    coberturaType: keyof Pick<DynamicCoberturaSelections[string], 'altoCosto' | 'medicamentos' | 'habitacion'>, 
    value: string
  ) => {
    if (isUpdating) return;
    
    // 🆕 RESETEAR FLAG DE NAVEGACIÓN cuando el usuario hace cambios manuales
    navigationLoadedRef.current = false;
    
    setDynamicCoberturaSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        const currentPlanSelections = newSelections[planName] || {
          altoCosto: "0",
          medicamentos: "0",
          habitacion: "0",
          odontologia: "0"
        };
        newSelections[planName] = {
          ...currentPlanSelections,
          [coberturaType]: value
        };
      } else {
        planes.forEach(plan => {
          const currentPlanSelections = newSelections[plan.plan] || {
            altoCosto: "0",
            medicamentos: "0",
            habitacion: "0",
            odontologia: "0"
          };
          newSelections[plan.plan] = {
            ...currentPlanSelections,
            [coberturaType]: value
          };
        });
      }
      
      return newSelections;
    });
    
    // Si se está seleccionando una cobertura, limpiar el copago relacionado
    if (value && value !== "0") {
      setDynamicCopagoSelections(prev => {
        const newCopagoSelections = { ...prev };
        
        if (cliente?.clientChoosen === 2) {
          const currentCopagoSelections = newCopagoSelections[planName] || {
            altoCosto: "0",
            medicamentos: "0",
            habitacion: "0"
          };
          newCopagoSelections[planName] = {
            ...currentCopagoSelections,
            [coberturaType]: "0" // Resetear copago cuando cambia la cobertura
          };
        } else {
          planes.forEach(plan => {
            const currentCopagoSelections = newCopagoSelections[plan.plan] || {
              altoCosto: "0",
              medicamentos: "0",
              habitacion: "0"
            };
            newCopagoSelections[plan.plan] = {
              ...currentCopagoSelections,
              [coberturaType]: "0" // Resetear copago cuando cambia la cobertura
            };
          });
        }
        
        return newCopagoSelections;
      });
    }
    
    // Actualizar el store inmediatamente
    if (cliente?.clientChoosen === 2) {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    } else {
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  }, [
    isUpdating,
    cliente?.clientChoosen,
    planes,
    planSelections,
    updatePlanOpcionales,
    setDynamicCoberturaSelections,
    setDynamicCopagoSelections,
    navigationLoadedRef
  ]);

  return {
    handleOdontologiaChange,
    handleDynamicCoberturaChange
  };
};
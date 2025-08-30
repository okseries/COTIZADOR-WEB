/**
 * Hook personalizado para manejar cambios en coberturas opcionales
 */

import { useCallback } from 'react';
import { updateSelectionsForClientType } from '../../utils/handler.utils';

interface UseHandlersProps {
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
  cliente: any;
  planes: any[];
  planSelections: Record<string, Record<string, string>>;
  updatePlanOpcionales: (planName: string, value: string) => void;
  setPlanSelections: Function;
  setDynamicCoberturaSelections: Function;
  setDynamicCopagoSelections: Function;
  navigationLoadedRef: React.MutableRefObject<boolean>;
}

export const useCoverageHandlers = ({
  isUpdating,
  setIsUpdating,
  cliente,
  planes,
  planSelections,
  updatePlanOpcionales,
  setPlanSelections,
  setDynamicCoberturaSelections,
  setDynamicCopagoSelections,
  navigationLoadedRef
}: UseHandlersProps) => {
  
  const isCollective = cliente?.clientChoosen === 2;

  const handleOdontologiaChange = useCallback((planName: string, value: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Actualizar selecciones
    setPlanSelections((prev: any) => {
      const newSelections = { ...prev };
      
      if (isCollective) {
        newSelections[planName] = {
          ...newSelections[planName],
          odontologia: value
        };
      } else {
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            odontologia: value
          };
        });
      }
      
      return newSelections;
    });
    
    // Actualizar store
    if (isCollective) {
      updatePlanOpcionales(planName, value);
    } else {
      planes.forEach(plan => {
        updatePlanOpcionales(plan.plan, value);
      });
    }
    
    setIsUpdating(false);
  }, [isUpdating, setIsUpdating, isCollective, planes, updatePlanOpcionales, setPlanSelections]);

  const handleDynamicCoberturaChange = useCallback((
    planName: string, 
    coberturaType: string, 
    value: string
  ) => {
    if (isUpdating) return;
    
    // Reset navegación al hacer selección manual
    navigationLoadedRef.current = false;
    
    setDynamicCoberturaSelections((prev: any) => {
      const newSelections = { ...prev };
      
      if (isCollective) {
        const currentPlanSelections = newSelections[planName] || {};
        newSelections[planName] = {
          ...currentPlanSelections,
          [coberturaType]: value
        };
      } else {
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            [coberturaType]: value
          };
        });
      }
      
      return newSelections;
    });
    
    // Limpiar copago si se selecciona "Ninguna"
    if (value === "0") {
      setDynamicCopagoSelections((prev: any) => {
        const newSelections = { ...prev };
        
        if (isCollective) {
          newSelections[planName] = {
            ...newSelections[planName],
            [coberturaType]: "0"
          };
        } else {
          planes.forEach(plan => {
            newSelections[plan.plan] = {
              ...newSelections[plan.plan],
              [coberturaType]: "0"
            };
          });
        }
        
        return newSelections;
      });
    }
    
    // Actualizar el store inmediatamente
    if (isCollective) {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    } else {
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  }, [isUpdating, isCollective, planes, planSelections, updatePlanOpcionales, navigationLoadedRef, setDynamicCoberturaSelections, setDynamicCopagoSelections]);

  return {
    handleOdontologiaChange,
    handleDynamicCoberturaChange
  };
};

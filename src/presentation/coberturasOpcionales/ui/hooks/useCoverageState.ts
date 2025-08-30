/**
 * Hook centralizado para manejar el estado de coberturas opcionales
 */

import { useState } from 'react';
import { 
  GlobalFilters,
  PlanSelections,
  PlanesData,
  CoberturaSelections,
  DynamicCoberturaSelections,
  DynamicCopagoSelectionsMap
} from '../../types/coverage.types';
import { DEFAULT_SELECTION_VALUE } from '../../constants/coverage.constants';

const defaultCoberturaSelections: CoberturaSelections = {
  altoCosto: DEFAULT_SELECTION_VALUE,
  medicamentos: DEFAULT_SELECTION_VALUE, 
  habitacion: DEFAULT_SELECTION_VALUE,
  odontologia: DEFAULT_SELECTION_VALUE
};

export const useCoverageState = () => {
  // Estados de selección
  const [planSelections, setPlanSelections] = useState<PlanSelections>({});
  const [coberturaSelections, setCoberturaSelections] = useState<Record<string, CoberturaSelections>>({});
  const [copagoSelections, setCopagoSelections] = useState<Record<string, string>>({});
  const [copagoHabitacionSelections, setCopagoHabitacionSelections] = useState<Record<string, string>>({});
  const [dynamicCoberturaSelections, setDynamicCoberturaSelections] = useState<DynamicCoberturaSelections>({});
  const [dynamicCopagoSelections, setDynamicCopagoSelections] = useState<DynamicCopagoSelectionsMap>({});
  
  // Estados de control
  const [userHasModifiedFilters, setUserHasModifiedFilters] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    altoCosto: false,
    medicamentos: false,
    habitacion: false,
    odontologia: false
  });
  const [planesData, setPlanesData] = useState<PlanesData>({});
  const [isUpdating, setIsUpdating] = useState(false);

  return {
    // Estados de selección
    planSelections,
    setPlanSelections,
    coberturaSelections,
    setCoberturaSelections,
    copagoSelections,
    setCopagoSelections,
    copagoHabitacionSelections,
    setCopagoHabitacionSelections,
    dynamicCoberturaSelections,
    setDynamicCoberturaSelections,
    dynamicCopagoSelections,
    setDynamicCopagoSelections,
    
    // Estados de control
    userHasModifiedFilters,
    setUserHasModifiedFilters,
    globalFilters,
    setGlobalFilters,
    planesData,
    setPlanesData,
    isUpdating,
    setIsUpdating,
    
    // Constantes
    defaultCoberturaSelections
  };
};

/**
 * Hook para configurar y manejar todas las queries de coberturas opcionales
 */

import { useMemo } from 'react';
import { usePlanesOpcionales, useCoberturasOpcionalesByType, useCopagos } from '../../hooks/usePlanesOpcionales';

interface UseQueriesConfig {
  cliente: any;
  planes: any[];
  globalFilters: any;
  isEditMode: boolean;
  hasAltoCostoInStore: boolean;
  hasMedicamentosInStore: boolean;
  hasHabitacionInStore: boolean;
}

export const useCoverageQueries = ({
  cliente,
  planes,
  globalFilters,
  isEditMode,
  hasAltoCostoInStore,
  hasMedicamentosInStore,
  hasHabitacionInStore
}: UseQueriesConfig) => {
  
  const tipoPlanParaAPI = cliente?.tipoPlan || 1;
  const isColectivo = cliente?.clientChoosen === 2;

  // Crear hooks individuales para cada plan - siempre llamar los hooks con condición de enabled
  const plan1Query = usePlanesOpcionales(
    planes[0]?.plan || '', 
    tipoPlanParaAPI, 
    cliente?.clientChoosen || 1, 
    !!planes[0]?.plan // enabled solo si hay nombre de plan
  );
  const plan2Query = usePlanesOpcionales(
    planes[1]?.plan || '', 
    tipoPlanParaAPI, 
    cliente?.clientChoosen || 1, 
    !!planes[1]?.plan
  );
  const plan3Query = usePlanesOpcionales(
    planes[2]?.plan || '', 
    tipoPlanParaAPI, 
    cliente?.clientChoosen || 1, 
    !!planes[2]?.plan
  );
  const plan4Query = usePlanesOpcionales(
    planes[3]?.plan || '', 
    tipoPlanParaAPI, 
    cliente?.clientChoosen || 1, 
    !!planes[3]?.plan
  );
  const plan5Query = usePlanesOpcionales(
    planes[4]?.plan || '', 
    tipoPlanParaAPI, 
    cliente?.clientChoosen || 1, 
    !!planes[4]?.plan
  );

  // Lógica mejorada para cargar opciones
  const shouldLoadAltoCosto = isColectivo && (
    isEditMode ? hasAltoCostoInStore : globalFilters.altoCosto
  );
  
  const shouldLoadMedicamentos = isColectivo && (
    isEditMode ? hasMedicamentosInStore : globalFilters.medicamentos
  );
  
  const shouldLoadHabitacion = isColectivo && (
    isEditMode ? hasHabitacionInStore : globalFilters.habitacion
  );
  
  // Odontología no necesita carga dinámica porque es estática
  const shouldLoadOdontologia = isColectivo && (
    isEditMode ? false : globalFilters.odontologia // Solo en modo crear
  );

  // Alto Costo
  const altoCostoOptionsQuery = useCoberturasOpcionalesByType(
    'altoCosto', 
    tipoPlanParaAPI, 
    shouldLoadAltoCosto
  );
  
  // Medicamentos
  const medicamentosOptionsQuery = useCoberturasOpcionalesByType(
    'medicamentos', 
    tipoPlanParaAPI, 
    shouldLoadMedicamentos
  );
  
  // Habitación
  const habitacionOptionsQuery = useCoberturasOpcionalesByType(
    'habitacion', 
    tipoPlanParaAPI, 
    shouldLoadHabitacion
  );
  
  // Odontología
  const odontologiaOptionsQuery = useCoberturasOpcionalesByType(
    'odontologia', 
    tipoPlanParaAPI, 
    shouldLoadOdontologia
  );

  // Copagos para medicamentos (solo si medicamentos está seleccionado)
  const copagosQuery = useCopagos(
    1, // ID para medicamentos
    cliente?.clientChoosen || 1
  );

  // Copagos para alto costo
  const copagosAltoCostoQuery = useCopagos(
    3, // ID para alto costo
    cliente?.clientChoosen || 1
  );

  // Copagos para habitación  
  const copagosHabitacionQuery = useCopagos(
    2, // ID para habitación
    cliente?.clientChoosen || 1
  );

  // Combinar resultados en un array
  const planQueriesData = useMemo(() => {
    const queries = [plan1Query, plan2Query, plan3Query, plan4Query, plan5Query];
    return planes.map((plan, index) => ({
      planName: plan.plan,
      data: planes[index] ? queries[index]?.data || null : null,
      isLoading: planes[index] ? queries[index]?.isLoading || false : false,
      error: planes[index] ? queries[index]?.error || null : null
    }));
  }, [
    planes.length,
    planes.map(p => p.plan).join(','),
    plan1Query?.data,
    plan2Query?.data,
    plan3Query?.data,
    plan4Query?.data,
    plan5Query?.data,
    plan1Query?.isLoading,
    plan2Query?.isLoading,
    plan3Query?.isLoading,
    plan4Query?.isLoading,
    plan5Query?.isLoading
  ]);

  return {
    // Plan queries
    planQueriesData,
    
    // Dynamic option queries
    altoCostoOptionsQuery,
    medicamentosOptionsQuery,
    habitacionOptionsQuery,
    odontologiaOptionsQuery,
    
    // Copago queries
    copagosQuery,
    copagosAltoCostoQuery,
    copagosHabitacionQuery,
    
    // Estado derivado
    isLoading: planQueriesData.some(q => q.isLoading),
    hasError: planQueriesData.some(q => q.error)
  };
};

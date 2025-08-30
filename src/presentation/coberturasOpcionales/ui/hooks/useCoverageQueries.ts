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
  isCollective: boolean;
  tipoPlanParaAPI: number;
  hasAltoCostoInStore: boolean;
  hasMedicamentosInStore: boolean;
  hasHabitacionInStore: boolean;
}

export const useCoverageQueries = ({
  cliente,
  planes,
  globalFilters,
  isEditMode,
  isCollective,
  tipoPlanParaAPI,
  hasAltoCostoInStore,
  hasMedicamentosInStore,
  hasHabitacionInStore
}: UseQueriesConfig) => {
  
  const isColectivo = isCollective;

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

  // SIMPLIFICADO: Siempre cargar opciones para que los selects funcionen
  const shouldLoadAltoCosto = isColectivo && planes.length > 0;
  const shouldLoadMedicamentos = isColectivo && planes.length > 0;
  const shouldLoadHabitacion = isColectivo && planes.length > 0;
  const shouldLoadOdontologia = isColectivo && planes.length > 0;

  // 🔍 DEBUG: Verificar condiciones de carga
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 QUERIES CONDITIONS:', {
      isColectivo,
      planesLength: planes.length,
      shouldLoadAltoCosto,
      shouldLoadMedicamentos,
      shouldLoadHabitacion,
      shouldLoadOdontologia,
      tipoPlanParaAPI
    });
  }

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

  // 🔍 DEBUG: Estado de las queries
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 QUERIES STATUS:', {
      altoCosto: {
        isLoading: altoCostoOptionsQuery.isLoading,
        dataLength: altoCostoOptionsQuery.data?.length || 0,
        hasData: !!altoCostoOptionsQuery.data,
        error: altoCostoOptionsQuery.error
      },
      medicamentos: {
        isLoading: medicamentosOptionsQuery.isLoading,
        dataLength: medicamentosOptionsQuery.data?.length || 0,
        hasData: !!medicamentosOptionsQuery.data,
        error: medicamentosOptionsQuery.error
      },
      habitacion: {
        isLoading: habitacionOptionsQuery.isLoading,
        dataLength: habitacionOptionsQuery.data?.length || 0,
        hasData: !!habitacionOptionsQuery.data,
        error: habitacionOptionsQuery.error
      },
      odontologia: {
        isLoading: odontologiaOptionsQuery.isLoading,
        dataLength: odontologiaOptionsQuery.data?.length || 0,
        hasData: !!odontologiaOptionsQuery.data,
        error: odontologiaOptionsQuery.error
      }
    });
  }

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
    
    // Data arrays (for convenience)
    altoCostoOptions: altoCostoOptionsQuery.data || [],
    medicamentosOptions: medicamentosOptionsQuery.data || [],
    habitacionOptions: habitacionOptionsQuery.data || [],
    odontologiaOptions: odontologiaOptionsQuery.data || [],
    copagosOptions: copagosQuery.data || [],
    copagosAltoCostoOptions: copagosAltoCostoQuery.data || [],
    copagosHabitacionOptions: copagosHabitacionQuery.data || [],
    
    // Estado derivado
    isLoading: planQueriesData.some(q => q.isLoading),
    hasError: planQueriesData.some(q => q.error),
    isEmpty: planes.length === 0
  };
};

/**
 * Hook especializado para manejar todos los efectos de inicialización
 * y sincronización en el sistema de coberturas opcionales
 */

import { useEffect, useRef } from 'react';
import { Plan, Cliente } from '@/presentation/quotations/interface/createQuotation.interface';
import { ODONTOLOGIA_OPTIONS } from '../../constants/coverage.constants';
import { detectOptionalType, mapQuotationToOptId } from '../../utils/coverage.utils';
import { UseQueryResult } from '@tanstack/react-query';
import { CoberturasOpcionaleColectivo, Copago, CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
import { 
  DynamicCoberturaSelections, 
  DynamicCopagoSelectionsMap,
  GlobalFilters,
  PlanSelections,
  PlanesData,
  CoberturaSelections
} from '../../types/coverage.types';

interface UseInitializationEffectsProps {
  cliente: Cliente | null;
  planes: Plan[];
  mode: number | "create" | undefined;
  isEditMode: boolean;
  isColectivo: boolean;
  
  // Queries
  planQueriesData: Array<{planName: string; data: CoberturasOpcional[] | undefined}>;
  altoCostoOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  medicamentosOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  habitacionOptionsQuery: UseQueryResult<CoberturasOpcionaleColectivo[], unknown>;
  copagosQuery: UseQueryResult<Copago[], unknown>;
  copagosAltoCostoQuery: UseQueryResult<Copago[], unknown>;
  copagosHabitacionQuery: UseQueryResult<Copago[], unknown>;
  
  // Estados
  planSelections: PlanSelections;
  setPlanSelections: React.Dispatch<React.SetStateAction<PlanSelections>>;
  coberturaSelections: {[planName: string]: CoberturaSelections};
  setCoberturaSelections: React.Dispatch<React.SetStateAction<{[planName: string]: CoberturaSelections}>>;
  dynamicCoberturaSelections: DynamicCoberturaSelections;
  setDynamicCoberturaSelections: React.Dispatch<React.SetStateAction<DynamicCoberturaSelections>>;
  dynamicCopagoSelections: DynamicCopagoSelectionsMap;
  setDynamicCopagoSelections: React.Dispatch<React.SetStateAction<DynamicCopagoSelectionsMap>>;
  globalFilters: GlobalFilters;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  planesData: PlanesData;
  setPlanesData: React.Dispatch<React.SetStateAction<PlanesData>>;
  userHasModifiedFilters: boolean;
  setUserHasModifiedFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setCopagoSelections: React.Dispatch<React.SetStateAction<{[planName: string]: string}>>;
  setCopagoHabitacionSelections: React.Dispatch<React.SetStateAction<{[planName: string]: string}>>;
  defaultCoberturaSelections: CoberturaSelections;
}

export const useInitializationEffects = ({
  cliente,
  planes,
  mode,
  isEditMode,
  isColectivo,
  planQueriesData,
  altoCostoOptionsQuery,
  medicamentosOptionsQuery,
  habitacionOptionsQuery,
  copagosQuery,
  copagosAltoCostoQuery,
  copagosHabitacionQuery,
  planSelections,
  setPlanSelections,
  coberturaSelections,
  setCoberturaSelections,
  dynamicCoberturaSelections,
  setDynamicCoberturaSelections,
  setDynamicCopagoSelections,
  setGlobalFilters,
  setPlanesData,
  userHasModifiedFilters,
  setCopagoSelections,
  setCopagoHabitacionSelections,
  defaultCoberturaSelections
}: UseInitializationEffectsProps) => {
  
  // Refs para controlar inicializaciones
  const initializedRef = useRef(false);
  const editModeInitializedRef = useRef(false);
  const previousModeRef = useRef<number | "create" | undefined>(undefined);
  const navigationLoadedRef = useRef(false);
  
  // Resetear refs SOLO cuando cambia el modo (create <-> edit)
  useEffect(() => {
    // Solo resetear si realmente cambió el modo, no en el primer render
    if (previousModeRef.current !== mode && previousModeRef.current !== undefined) {
      initializedRef.current = false;
      editModeInitializedRef.current = false;
      navigationLoadedRef.current = false;
    }
    previousModeRef.current = mode;
  }, [mode]);

  // 🚨 NUEVO: Resetear editModeInitializedRef cuando cambien las opciones disponibles
  useEffect(() => {
    if (isEditMode && cliente?.clientChoosen === 2) {
      const dataChanged = 
        (altoCostoOptionsQuery.data?.length || 0) > 0 ||
        (medicamentosOptionsQuery.data?.length || 0) > 0 ||
        (habitacionOptionsQuery.data?.length || 0) > 0;
      
      if (dataChanged && editModeInitializedRef.current) {
        editModeInitializedRef.current = false;
      }
    }
  }, [
    isEditMode,
    cliente?.clientChoosen,
    altoCostoOptionsQuery.data?.length,
    medicamentosOptionsQuery.data?.length,
    habitacionOptionsQuery.data?.length
  ]);

  // Cargar datos de las peticiones
  useEffect(() => {
    const newPlanesData: {[planName: string]: CoberturasOpcional[]} = {};
    let hasChanges = false;
    
    planQueriesData.forEach(({ planName, data }) => {
      if (data && planName) {
        newPlanesData[planName] = data;
        hasChanges = true;
      }
    });
    
    if (hasChanges && Object.keys(newPlanesData).length > 0) {
      setPlanesData(newPlanesData);
    }
  }, [
    planQueriesData.map(q => `${q.planName}:${q.data?.length || 0}`).join(',')
  ]);

  // 🆕 EFECTO CRÍTICO: Mapeo correcto entre cotización guardada y catálogo de opciones
  useEffect(() => {
    if (!isEditMode || !isColectivo || planes.length === 0) return;
    
    const initialSelections: {[planName: string]: {
      altoCosto: string;
      medicamentos: string;
      habitacion: string;
      odontologia: string;
    }} = {};
    
    const initialCopagos: {[planName: string]: {
      altoCosto: string;
      medicamentos: string;
      habitacion: string;
    }} = {};
    
    planes.forEach(plan => {
      initialSelections[plan.plan] = {
        altoCosto: "",
        medicamentos: "",
        habitacion: "",
        odontologia: ""
      };
      
      initialCopagos[plan.plan] = {
        altoCosto: "0",
        medicamentos: "0", 
        habitacion: "0"
      };
      
      plan.opcionales.forEach(opcional => {
        // Detectar tipo automáticamente si no existe
        const tipoDetectado = opcional.tipoOpcionalId || detectOptionalType(opcional.nombre);
        
        switch (tipoDetectado) {
          case 3: // Alto Costo
            if (opcional.nombre === "ALTO COSTO" && altoCostoOptionsQuery.data) {
              const optId = mapQuotationToOptId(opcional, altoCostoOptionsQuery.data || []);
              if (optId) {
                initialSelections[plan.plan].altoCosto = optId;
              }
            } else if (opcional.nombre === "COPAGO ALTO COSTO") {
              if (opcional.idCopago) {
                initialCopagos[plan.plan].altoCosto = opcional.idCopago.toString();
              } else if (copagosAltoCostoQuery.data) {
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosAltoCostoQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1;
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].altoCosto = copagoMatch.id.toString();
                }
              }
            }
            break;
            
          case 1: // Medicamentos
            if (opcional.nombre === "MEDICAMENTOS" && medicamentosOptionsQuery.data) {
              const optId = mapQuotationToOptId(opcional, medicamentosOptionsQuery.data || []);
              if (optId) {
                initialSelections[plan.plan].medicamentos = optId;
              }
            } else if (opcional.nombre === "COPAGO MEDICAMENTOS") {
              if (opcional.idCopago) {
                initialCopagos[plan.plan].medicamentos = opcional.idCopago.toString();
              } else if (copagosQuery.data) {
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1;
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].medicamentos = copagoMatch.id.toString();
                }
              }
            }
            break;
            
          case 2: // Habitación
            if (opcional.nombre === "HABITACION" && habitacionOptionsQuery.data) {
              const optId = mapQuotationToOptId(opcional, habitacionOptionsQuery.data || []);
              if (optId) {
                initialSelections[plan.plan].habitacion = optId;
              }
            } else if (opcional.nombre === "COPAGO HABITACIÓN") {
              if (opcional.idCopago) {
                initialCopagos[plan.plan].habitacion = opcional.idCopago.toString();
              } else if (copagosHabitacionQuery.data) {
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosHabitacionQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1;
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].habitacion = copagoMatch.id.toString();
                }
              }
            }
            break;
            
          case 4: // Odontología (estática - no necesita mapeo)
            if (opcional.nombre === "ODONTOLOGIA") {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitaria = opcional.prima / cantidadAfiliados;
              const odontologiaMatch = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
              
              if (odontologiaMatch) {
                initialSelections[plan.plan].odontologia = odontologiaMatch.value;
              }
            }
            break;
        }
      });
    });
    
    // Aplicar las selecciones mapeadas
    setDynamicCoberturaSelections(initialSelections);
    setDynamicCopagoSelections(initialCopagos);
    
  }, [
    isEditMode,
    isColectivo,
    planes.length,
    altoCostoOptionsQuery.data?.length,
    medicamentosOptionsQuery.data?.length,
    habitacionOptionsQuery.data?.length,
    altoCostoOptionsQuery.isLoading,
    medicamentosOptionsQuery.isLoading,
    habitacionOptionsQuery.isLoading
  ]);

  // Inicializar selecciones de odontología para cada plan - CON CONTROL DE REFS
  useEffect(() => {
    if (planes.length === 0) return;
    
    const initialSelections: {[planName: string]: {[key: string]: string}} = {};
    let needsUpdate = false;
    
    planes.forEach(plan => {
      const hasOdontologiaInStore = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
      
      const shouldReset = !isEditMode || !planSelections[plan.plan] || (hasOdontologiaInStore && !initializedRef.current);
      
      if (shouldReset) {
        const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
        let odontologiaValue = "0";
        
        if (isEditMode && odontologiaOpcional) {
          const cantidadAfiliados = plan.cantidadAfiliados || 1;
          const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
          
          const staticOdontologiaMatch = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
          if (staticOdontologiaMatch) {
            odontologiaValue = staticOdontologiaMatch.value;
          } else {
            odontologiaValue = "3";
          }
        } else if (!isEditMode && odontologiaOpcional) {
          const cantidadAfiliados = plan.cantidadAfiliados || 1;
          const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
          
          const staticOdontologiaMatch = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
          if (staticOdontologiaMatch) {
            odontologiaValue = staticOdontologiaMatch.value;
          } else {
            odontologiaValue = "0";
          }
        } else {
          odontologiaValue = "0";
        }
        
        initialSelections[plan.plan] = {
          odontologia: odontologiaValue
        };
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      setPlanSelections(prev => ({ ...prev, ...initialSelections }));
      initializedRef.current = true;
    }
  }, [planes.length, isEditMode]);

  // Inicializar selecciones de cobertura con valores por defecto
  useEffect(() => {
    if (planes.length > 0 && cliente?.clientChoosen === 2) {
      const initialCoberturaSelections: {[planName: string]: CoberturaSelections} = {};
      let needsCoberturaUpdate = false;

      planes.forEach(plan => {
        if (!coberturaSelections[plan.plan]) {
          initialCoberturaSelections[plan.plan] = { ...defaultCoberturaSelections };
          needsCoberturaUpdate = true;
        }
      });

      if (needsCoberturaUpdate) {
        setCoberturaSelections(prev => ({ ...prev, ...initialCoberturaSelections }));
      }
    }
  }, [planes.length, cliente?.clientChoosen, Object.keys(coberturaSelections).length]);

  // Inicializar filtros globales desde el store - CON CONTROL DE REFS
  useEffect(() => {
    if (planes.length === 0 || userHasModifiedFilters) return;
    
    if (cliente?.clientChoosen === 2) {
      const firstPlan = planes[0];
      if (firstPlan && firstPlan.opcionales.length > 0) {
        const hasAltoCosto = firstPlan.opcionales.some(opt => opt.nombre === "ALTO COSTO");
        const hasMedicamentos = firstPlan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS");
        const hasHabitacion = firstPlan.opcionales.some(opt => opt.nombre === "HABITACION");
        const hasOdontologia = firstPlan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA");

        setGlobalFilters({
          altoCosto: hasAltoCosto,
          medicamentos: hasMedicamentos,
          habitacion: hasHabitacion,
          odontologia: hasOdontologia
        });
      } else {
        if (isEditMode) {
          setGlobalFilters({
            altoCosto: false,
            medicamentos: false,
            habitacion: false,
            odontologia: false
          });
        } else {
          setGlobalFilters({
            altoCosto: false,
            medicamentos: false,
            habitacion: false,
            odontologia: false
          });
        }
      }
    } else if (cliente?.clientChoosen === 1) {
      setGlobalFilters({
        altoCosto: true,
        medicamentos: true,
        habitacion: true,
        odontologia: true
      });
    }
  }, [cliente?.clientChoosen, planes.length, isEditMode]);
  
  // Efecto para navegación entre steps
  useEffect(() => {
    const isReturningToStep3 = planes.length > 0 && 
                               Object.keys(planSelections).length < planes.length &&
                               Object.keys(dynamicCoberturaSelections).length < planes.length &&
                               planes.some(plan => plan.opcionales.length > 0);
    
    if (isReturningToStep3) {
      const hasOpcionalesInStore = planes.some(plan => plan.opcionales.length > 0);
      
      if (hasOpcionalesInStore) {
        initializedRef.current = false;
        editModeInitializedRef.current = false;
        
        const initialPlanSelections: {[planName: string]: {[key: string]: string}} = {};
        const initialCopagoSelections: {[planName: string]: string} = {};
        const initialCopagoHabitacionSelections: {[planName: string]: string} = {};
        const initialDynamicCoberturaSelections: {[planName: string]: {altoCosto: string; medicamentos: string; habitacion: string; odontologia: string}} = {};
        const initialDynamicCopagoSelections: {[planName: string]: {altoCosto: string; medicamentos: string; habitacion: string}} = {};
        const detectedFilters = {
          altoCosto: false,
          medicamentos: false,
          habitacion: false,
          odontologia: false
        };
        
        planes.forEach(plan => {
          initialPlanSelections[plan.plan] = {
            odontologia: "0"
          };
          
          initialDynamicCoberturaSelections[plan.plan] = {
            altoCosto: "0",
            medicamentos: "0", 
            habitacion: "0",
            odontologia: "0"
          };
          
          initialDynamicCopagoSelections[plan.plan] = {
            altoCosto: "0",
            medicamentos: "0",
            habitacion: "0"
          };
          
          plan.opcionales.forEach(opcional => {
            switch (opcional.nombre) {
              case "ALTO COSTO":
                if (opcional.originalOptId) {
                  initialDynamicCoberturaSelections[plan.plan].altoCosto = opcional.originalOptId.toString();
                  detectedFilters.altoCosto = true;
                } else if (opcional.id) {
                  initialDynamicCoberturaSelections[plan.plan].altoCosto = opcional.id.toString();
                  detectedFilters.altoCosto = true;
                }
                break;
                
              case "COPAGO ALTO COSTO":
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].altoCosto = opcional.idCopago.toString();
                }
                break;
                
              case "MEDICAMENTOS":
                if (opcional.originalOptId) {
                  initialDynamicCoberturaSelections[plan.plan].medicamentos = opcional.originalOptId.toString();
                  detectedFilters.medicamentos = true;
                } else if (opcional.id) {
                  initialDynamicCoberturaSelections[plan.plan].medicamentos = opcional.id.toString();
                  detectedFilters.medicamentos = true;
                }
                break;
                
              case "COPAGO MEDICAMENTOS":
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].medicamentos = opcional.idCopago.toString();
                }
                break;
                
              case "HABITACION":
                if (opcional.originalOptId) {
                  initialDynamicCoberturaSelections[plan.plan].habitacion = opcional.originalOptId.toString();
                  detectedFilters.habitacion = true;
                } else if (opcional.id) {
                  initialDynamicCoberturaSelections[plan.plan].habitacion = opcional.id.toString();
                  detectedFilters.habitacion = true;
                }
                break;
                
              case "COPAGO HABITACIÓN":
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].habitacion = opcional.idCopago.toString();
                }
                break;
                
              case "ODONTOLOGIA":
              case "ODONTOLOGÍA":
                if (opcional.prima) {
                  const cantidadAfiliados = plan.cantidadAfiliados || 1;
                  const primaUnitaria = opcional.prima / cantidadAfiliados;
                  
                  const matchingOption = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
                  
                  if (matchingOption) {
                    initialPlanSelections[plan.plan].odontologia = matchingOption.value;
                    detectedFilters.odontologia = true;
                  }
                }
                break;
            }
          });
        });
        
        setPlanSelections(initialPlanSelections);
        setDynamicCoberturaSelections(initialDynamicCoberturaSelections);
        setDynamicCopagoSelections(initialDynamicCopagoSelections);
        setCopagoSelections(initialCopagoSelections);
        setCopagoHabitacionSelections(initialCopagoHabitacionSelections);
        setGlobalFilters(detectedFilters);
        
        navigationLoadedRef.current = true;
      }
    }
  }, [
    planes.length, 
    planSelections, 
    dynamicCoberturaSelections, 
    ODONTOLOGIA_OPTIONS
  ]);
  
  return {
    initializedRef,
    editModeInitializedRef,
    navigationLoadedRef
  };
};

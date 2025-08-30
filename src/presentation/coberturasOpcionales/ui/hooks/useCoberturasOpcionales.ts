/**
 * Hook para manejar coberturas opcionales
 * 
 * Funcionalidades principales:
 * - Gestión de selecciones de cobertura por plan
 * - Mapeo correcto entre frontend (opt_id) y backend 
 * - Soporte para modos crear/editar
 * - Manejo diferenciado entre individuales y colectivos
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { usePlanesOpcionales, useCoberturasOpcionalesByType, useCopagos } from '../../hooks/usePlanesOpcionales';
import { CoberturasOpcional, CoberturasOpcionaleColectivo, Copago } from '../../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { OdontologiaOption } from '../components/OdontologiaSelect';

// Importar constantes y utilidades
import { 
  COVERAGE_TYPES, 
  OPTIONAL_TYPE_IDS, 
  DEFAULT_SELECTION_VALUE, 
  ODONTOLOGIA_OPTIONS 
} from '../../constants/coverage.constants';
import { 
  CoberturaSelections, 
  DynamicCopagoSelections, 
  GlobalFilters,
  PlanSelections,
  PlanesData,
  DynamicCoberturaSelections,
  DynamicCopagoSelectionsMap
} from '../../types/coverage.types';
import { detectOptionalType, mapQuotationToOptId } from '../../utils/coverage.utils';
import { createCoverageOptional, createCopagoOptional, createStaticOptional } from '../../utils/optional.helpers';
import { useCoverageHandlers } from './useCoverageHandlers';
import { useCoverageState } from './useCoverageState';
import { useCoverageQueries } from './useCoverageQueries';
import { usePlanUpdater } from './usePlanUpdater';
import { useInitializationEffects } from './useInitializationEffects';
import { updateSelectionsForClientType, updatePlansInStore } from '../../utils/handler.utils';

export const useCoberturasOpcionales = () => {
  // Acceder directamente a los datos del store sin usar getFinalObject en cada render
  const { cliente, planes, updatePlanByName, mode } = useUnifiedQuotationStore();
  
  // Hook centralizado para manejar estado
  const {
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
    userHasModifiedFilters,
    setUserHasModifiedFilters,
    globalFilters,
    setGlobalFilters,
    planesData,
    setPlanesData,
    isUpdating,
    setIsUpdating,
    defaultCoberturaSelections
  } = useCoverageState();
  
  // Obtener el mode para detectar si estamos editando
  const isEditMode = mode !== "create";
  
  // Variable auxiliar
  const isColectivo = cliente?.clientChoosen === 2;
  
  // API parameters
  const tipoPlanParaAPI = cliente?.tipoPlan || 1;

  // 🆕 MEJORA CRÍTICA: En modo edición, solo cargar opciones que realmente están seleccionadas
  // Detectar qué tipos de cobertura están realmente en el store
  const hasAltoCostoInStore = useMemo(() => {
    return planes.some(plan => 
      plan.opcionales.some(opt => 
        opt.nombre === "ALTO COSTO" || opt.tipoOpcionalId === 3
      )
    );
  }, [planes]);
  
  const hasMedicamentosInStore = useMemo(() => {
    return planes.some(plan => 
      plan.opcionales.some(opt => 
        opt.nombre === "MEDICAMENTOS" || opt.tipoOpcionalId === 1
      )
    );
  }, [planes]);
  
  const hasHabitacionInStore = useMemo(() => {
    return planes.some(plan => 
      plan.opcionales.some(opt => 
        opt.nombre === "HABITACION" || opt.tipoOpcionalId === 2
      )
    );
  }, [planes]);

  // Hook centralizado para todas las queries
  const {
    planQueriesData,
    altoCostoOptionsQuery,
    medicamentosOptionsQuery,
    habitacionOptionsQuery,
    odontologiaOptionsQuery: ODONTOLOGIA_OPTIONSQuery,
    copagosQuery,
    copagosAltoCostoQuery,
    copagosHabitacionQuery,
    isLoading,
    hasError
  } = useCoverageQueries({
    cliente,
    planes,
    globalFilters,
    isEditMode,
    isCollective: isColectivo,
    tipoPlanParaAPI,
    hasAltoCostoInStore,
    hasMedicamentosInStore,
    hasHabitacionInStore
  });
  
  // Hook de inicialización y efectos
  const {
    initializedRef,
    editModeInitializedRef,
    navigationLoadedRef
  } = useInitializationEffects({
    cliente,
    planes,
    mode,
    isEditMode,
    isColectivo,
    planQueriesData: planQueriesData.map(item => ({
      planName: item.planName || '',
      data: item.data || undefined
    })),
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
    dynamicCopagoSelections,
    setDynamicCopagoSelections,
    globalFilters,
    setGlobalFilters,
    planesData,
    setPlanesData,
    userHasModifiedFilters,
    setUserHasModifiedFilters,
    setCopagoSelections,
    setCopagoHabitacionSelections,
    defaultCoberturaSelections
  });

  // Hook de actualización de planes
  const { updatePlanOpcionales } = usePlanUpdater({
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
  });

  const handleCopagoHabitacionChange = (planName: string, value: string) => {
    if (isUpdating) return;
    
    setCopagoHabitacionSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        newSelections[planName] = value;
      } else {
        planes.forEach(plan => {
          newSelections[plan.plan] = value;
        });
      }
      
      return newSelections;
    });
    
    // Actualizar inmediatamente
    if (cliente?.clientChoosen === 2) {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    } else {
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  };
  
  const handleCopagoChange = (planName: string, value: string) => {
    if (isUpdating) return;
    
    setCopagoSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        newSelections[planName] = value;
      } else {
        planes.forEach(plan => {
          newSelections[plan.plan] = value;
        });
      }
      
      return newSelections;
    });
    
    // Actualizar inmediatamente
    if (cliente?.clientChoosen === 2) {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    } else {
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  };
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
  ]); // Depender solo de una representación string estable de los datos

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
              // 🆕 MAPEO COPAGO SIN idCopago: usar prima para encontrar coincidencia
              if (opcional.idCopago) {
                // Si existe idCopago, usarlo directamente
                initialCopagos[plan.plan].altoCosto = opcional.idCopago.toString();
              } else if (copagosAltoCostoQuery.data) {
                // Si no existe idCopago, mapear por prima
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosAltoCostoQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1; // Tolerancia de 1 peso
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].altoCosto = copagoMatch.id.toString();
                } else {
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
              // 🆕 MAPEO COPAGO SIN idCopago: usar prima para encontrar coincidencia
              if (opcional.idCopago) {
                // Si existe idCopago, usarlo directamente
                initialCopagos[plan.plan].medicamentos = opcional.idCopago.toString();
              } else if (copagosQuery.data) {
                // Si no existe idCopago, mapear por prima
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1; // Tolerancia de 1 peso
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].medicamentos = copagoMatch.id.toString();
                } else {
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
              // 🆕 MAPEO COPAGO SIN idCopago: usar prima para encontrar coincidencia
              if (opcional.idCopago) {
                // Si existe idCopago, usarlo directamente
                initialCopagos[plan.plan].habitacion = opcional.idCopago.toString();
              } else if (copagosHabitacionQuery.data) {
                // Si no existe idCopago, mapear por prima
                const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                const copagoMatch = copagosHabitacionQuery.data.find(copago => {
                  const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                  const diferencia = Math.abs(precioAPI - primaUnitaria);
                  return diferencia < 1; // Tolerancia de 1 peso
                });
                
                if (copagoMatch) {
                  initialCopagos[plan.plan].habitacion = copagoMatch.id.toString();
                } else {
                }
              }
            }
            break;
            
          case 4: // Odontología (estática - no necesita mapeo)
            if (opcional.nombre === "ODONTOLOGIA") {
              // Odontología usa mapeo estático por prima
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
    // Solo ejecutar cuando los datos del catálogo estén disponibles
    altoCostoOptionsQuery.isLoading,
    medicamentosOptionsQuery.isLoading,
    habitacionOptionsQuery.isLoading
  ]);

  // Inicializar selecciones de odontología para cada plan - CON CONTROL DE REFS
  useEffect(() => {
    // 🆕 NUEVA LÓGICA: Si hay planes con opcionales, SIEMPRE cargar desde el store
    // Esto soluciona el problema de navegación entre steps
    if (planes.length === 0) return;
    
    const initialSelections: {[planName: string]: {[key: string]: string}} = {};
    let needsUpdate = false;
    
    planes.forEach(plan => {
      // 🔧 FIX: Cargar SIEMPRE si no existe la selección O si hay datos en el store
      const hasOdontologiaInStore = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
      
      // 🆕 FIX MODO CREAR: En modo crear, siempre resetear a valor por defecto "0"
      // En modo editar, cargar desde el store si existe
      const shouldReset = !isEditMode || !planSelections[plan.plan] || (hasOdontologiaInStore && !initializedRef.current);
      
      if (shouldReset) {
        const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
        let odontologiaValue = "0"; // Valor por defecto
        
        // 🆕 FIX MODO CREAR: En modo crear, usar "0" EXCEPTO si hay datos del store (navegación)
        if (isEditMode && odontologiaOpcional) {
          // Solo en modo editar: mapear desde el store
          const cantidadAfiliados = plan.cantidadAfiliados || 1;
          const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
          
          const staticOdontologiaMatch = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
          if (staticOdontologiaMatch) {
            odontologiaValue = staticOdontologiaMatch.value;
          } else {
            odontologiaValue = "3"; // Fallback
          }
        } else if (!isEditMode && odontologiaOpcional) {
          // En modo crear CON datos en el store (navegación): cargar ESPECÍFICO DE ESTE PLAN
          // 🔧 IMPORTANTE: Cada plan mantiene su propio valor de odontología en colectivos
          const cantidadAfiliados = plan.cantidadAfiliados || 1;
          const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
          
          const staticOdontologiaMatch = ODONTOLOGIA_OPTIONS.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
          if (staticOdontologiaMatch) {
            odontologiaValue = staticOdontologiaMatch.value;

          } else {
            odontologiaValue = "0";
          }
        } else {
          // En modo crear SIN datos en el store: usar valor por defecto "0" específico por plan

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
      initializedRef.current = true; // Marcar como inicializado
    }
  }, [planes.length, isEditMode]); // 🆕 Agregar isEditMode como dependencia

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
      // Para colectivos, leer las opcionales existentes para determinar qué filtros deben estar activos
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
        // 🆕 MODO EDICIÓN SIN OPCIONALES: No forzar filtros, la detección selectiva se encarga
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
      // Para individuales, todas las coberturas se incluyen automáticamente
      setGlobalFilters({
        altoCosto: true,
        medicamentos: true,
        habitacion: true,
        odontologia: true
      });
    }
  }, [cliente?.clientChoosen, planes.length, isEditMode]); // ✅ Agregar isEditMode como dependencia
  
  // Efecto para navegación entre steps
  useEffect(() => {
    // Detectar navegación de vuelta al Step 3
    const isReturningToStep3 = planes.length > 0 && 
                               Object.keys(planSelections).length < planes.length &&
                               Object.keys(dynamicCoberturaSelections).length < planes.length &&
                               planes.some(plan => plan.opcionales.length > 0);
    
    if (isReturningToStep3) {
      const hasOpcionalesInStore = planes.some(plan => plan.opcionales.length > 0);
      
      if (hasOpcionalesInStore) {
        
        // Forzar reinicialización resetando los refs
        initializedRef.current = false;
        editModeInitializedRef.current = false;
        
        // Cargar todos los estados desde el store
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
        
        // 🆕 CARGAR SELECCIONES ESPECÍFICAS DE CADA PLAN (incluyendo odontología)
        planes.forEach(plan => {
          // 🔧 INICIALIZAR selecciones específicas para cada plan
          initialPlanSelections[plan.plan] = {
            odontologia: "0" // Valor por defecto, se sobrescribirá si existe en el store
          };
          
          // Inicializar estructura para este plan
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
          
          // 🔧 MAPEAR TODAS LAS SELECCIONES ESPECÍFICAS DE ESTE PLAN - USANDO originalOptId
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
        
        // Aplicar todos los estados cargados
        setPlanSelections(initialPlanSelections);
        setDynamicCoberturaSelections(initialDynamicCoberturaSelections);
        setDynamicCopagoSelections(initialDynamicCopagoSelections);
        setCopagoSelections(initialCopagoSelections);
        setCopagoHabitacionSelections(initialCopagoHabitacionSelections);
        
        // Activar filtros globales basados en lo encontrado
        setGlobalFilters(detectedFilters);
        
        navigationLoadedRef.current = true;
      }
    }
  }, [
    planes.length, 
    planSelections, 
    dynamicCoberturaSelections, 
    copagoSelections, 
    ODONTOLOGIA_OPTIONS
  ]);
  
  // Inicializar selecciones dinámicas cuando hay datos disponibles - CON CONTROL DE REFS
  useEffect(() => {
    // Solo ejecutar para modo edición con colectivos
    if (cliente?.clientChoosen !== 2 || planes.length === 0 || !isEditMode) return;
    
    // 🚨 CAMBIO CRÍTICO: Solo ejecutar una vez cuando todas las opciones estén cargadas
    const allOptionsLoaded = 
      !altoCostoOptionsQuery.isLoading && 
      !medicamentosOptionsQuery.isLoading && 
      !habitacionOptionsQuery.isLoading &&
      !copagosQuery.isLoading &&
      !copagosAltoCostoQuery.isLoading &&
      !copagosHabitacionQuery.isLoading;
    
    // Solo proceder si ya tenemos datos del store Y las opciones de API están cargadas
    // 🆕 TAMBIÉN permitir reinicialización si no hay selecciones dinámicas (navegación entre steps)
    const hasAnyDynamicSelections = Object.keys(dynamicCoberturaSelections).length > 0;
    
    // 🆕 FIX NAVEGACIÓN: Si ya hay selecciones cargadas Y son específicas por plan, NO ejecutar mapeo
    const hasValidPlanSpecificSelections = hasAnyDynamicSelections && 
      planes.length > 1 && 
      Object.keys(dynamicCoberturaSelections).length === planes.length;
    
    if (!allOptionsLoaded || 
        (editModeInitializedRef.current && hasValidPlanSpecificSelections) ||
        navigationLoadedRef.current) {
      return;
    }
    
    const newDynamicSelections: typeof dynamicCoberturaSelections = {};
    const newDynamicCopagoSelections: typeof dynamicCopagoSelections = {};
    let hasChanges = false;
    
    planes.forEach(plan => {
      if (plan.opcionales.length > 0) {
        
        const opcionales = plan.opcionales || [];
        const selections = {
          altoCosto: '',
          medicamentos: '',
          habitacion: '',
          odontologia: ''
        };
        
        opcionales.forEach(opcional => {
          if (opcional.nombre === "ALTO COSTO" && opcional.id) {
            if (opcional.tipoOpcionalId) {
              if (opcional.tipoOpcionalId === 3) {
                selections.altoCosto = opcional.id.toString();
              } else {
                selections.altoCosto = opcional.id.toString();
              }
            } else {
              selections.altoCosto = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO ALTO COSTO" && opcional.idCopago) {
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].altoCosto = opcional.idCopago.toString();
          } else if (opcional.nombre === "MEDICAMENTOS" && opcional.id) {
            if (opcional.tipoOpcionalId) {
              if (opcional.tipoOpcionalId === 1) {
                selections.medicamentos = opcional.id.toString();
              } else {
                selections.medicamentos = opcional.id.toString();
              }
            } else {
              selections.medicamentos = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO MEDICAMENTOS" && opcional.idCopago) {
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].medicamentos = opcional.idCopago.toString();
          } else if (opcional.nombre === "HABITACION" && opcional.id) {
            if (opcional.tipoOpcionalId) {
              if (opcional.tipoOpcionalId === 2) {
                selections.habitacion = opcional.id.toString();
              } else {
                selections.habitacion = opcional.id.toString();
              }
            } else {
              selections.habitacion = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO HABITACIÓN" && opcional.idCopago) {
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].habitacion = opcional.idCopago.toString();
          }
        });
        
        
        
        newDynamicSelections[plan.plan] = selections;
        hasChanges = true;
      }
    });
    
    // Actualizar estado solo si hay cambios reales
    if (hasChanges) {
      
     
      
      setDynamicCoberturaSelections(prev => ({ 
        ...prev, 
        ...newDynamicSelections 
      }));

      

      // 🚨 FIX QUIRÚRGICO: Forzar actualización de filtros globales basado en las selecciones detectadas
      const hasAnyAltoCosto = Object.values(newDynamicSelections).some(sel => sel.altoCosto !== '');
      const hasAnyMedicamentos = Object.values(newDynamicSelections).some(sel => sel.medicamentos !== '');
      const hasAnyHabitacion = Object.values(newDynamicSelections).some(sel => sel.habitacion !== '');
      
      // 🦷 FIX ODONTOLOGÍA: Verificar si hay odontología en el store directamente desde las opcionales
      const hasAnyOdontologia = planes.some(plan => 
        plan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA")
      );


      setGlobalFilters(prev => ({
        ...prev,
        altoCosto: hasAnyAltoCosto,
        medicamentos: hasAnyMedicamentos,
        habitacion: hasAnyHabitacion,
        odontologia: hasAnyOdontologia
      }));

      
    }
    
    if (Object.keys(newDynamicCopagoSelections).length > 0) {
      setDynamicCopagoSelections(prev => ({ 
        ...prev, 
        ...newDynamicCopagoSelections 
      }));
    }
    
    editModeInitializedRef.current = true; // Marcar como inicializado
    // 🚫 NO RESETEAR navigationLoadedRef aquí - debe mantenerse hasta nueva selección manual
  }, [
    isEditMode, 
    planes.length,
    altoCostoOptionsQuery.isLoading,
    medicamentosOptionsQuery.isLoading,
    habitacionOptionsQuery.isLoading,
    copagosQuery.isLoading,
    copagosAltoCostoQuery.isLoading,
    copagosHabitacionQuery.isLoading,
    altoCostoOptionsQuery.data?.length,
    medicamentosOptionsQuery.data?.length,
    habitacionOptionsQuery.data?.length,
    copagosQuery.data?.length,
    copagosAltoCostoQuery.data?.length,
    copagosHabitacionQuery.data?.length
  ]); // 🚨 DEPENDENCIAS CRÍTICAS: Re-ejecutar cuando cambien los datos de las queries

  // Actualizar planes cuando cambian los filtros globales (solo para colectivos)
  useEffect(() => {
    const shouldUpdate = cliente?.clientChoosen === 2 && 
                        !isUpdating && 
                        Object.keys(planesData).length > 0 &&
                        (!isEditMode || editModeInitializedRef.current);
    
    const hasExistingOpcionales = isEditMode && planes.some(plan => plan.opcionales.length > 0);
    
    if (shouldUpdate && !hasExistingOpcionales) {
      planes.forEach(plan => {
        if (planesData[plan.plan] && planSelections[plan.plan]) {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        }
      });
    }
  }, [
    globalFilters.altoCosto, 
    globalFilters.medicamentos, 
    globalFilters.habitacion, 
    globalFilters.odontologia,
    cliente?.clientChoosen
  ]);

  // Actualizar automáticamente para individuales cuando se cargan los datos
  useEffect(() => {
    if (cliente?.clientChoosen === 1 && !isUpdating && Object.keys(planesData).length > 0 && Object.keys(planSelections).length > 0) {
      planes.forEach(plan => {
        if (planesData[plan.plan] && planSelections[plan.plan]) {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        }
      });
    }
  }, [
    cliente?.clientChoosen,
    Object.keys(planesData).length,
    Object.keys(planSelections).length
  ]);

  // ELIMINADO: useEffect problemático que causaba bucle infinito
  // Ya no es necesario un useEffect complejo para cargar datos por primera vez

  const handleGlobalFilterChange = (filter: string, checked: boolean) => {
    setUserHasModifiedFilters(true);
    setGlobalFilters(prev => ({
      ...prev,
      [filter]: checked
    }));

    // Si se está desactivando una cobertura, limpiar las selecciones relacionadas
    if (!checked && cliente?.clientChoosen === 2) {
      planes.forEach(plan => {
        // Limpiar selección de cobertura
        setDynamicCoberturaSelections(prev => ({
          ...prev,
          [plan.plan]: {
            ...prev[plan.plan],
            [filter]: ''
          }
        }));
        
        // Limpiar copago relacionado
        setDynamicCopagoSelections(prev => ({
          ...prev,
          [plan.plan]: {
            ...prev[plan.plan],
            [filter]: ''
          }
        }));

        // Limpiar odontología si es necesario
        if (filter === 'odontologia') {
          setPlanSelections(prev => ({
            ...prev,
            [plan.plan]: {
              ...prev[plan.plan],
              odontologia: "0"
            }
          }));
        }
      });
      
      // Actualizar el store inmediatamente
      planes.forEach(plan => {
        const odontologiaValue = filter === 'odontologia' ? "0" : (planSelections[plan.plan]?.odontologia || "0");
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  };

  // Usar hook personalizado para handlers
  const { handleOdontologiaChange, handleDynamicCoberturaChange } = useCoverageHandlers({
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
  });

  const handleCoberturaChange = (planName: string, coberturaType: keyof CoberturaSelections, value: string) => {
    if (isUpdating) return;
    
    setCoberturaSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        newSelections[planName] = {
          ...newSelections[planName],
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
    
    // Actualizar inmediatamente
    if (cliente?.clientChoosen === 2) {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    } else {
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
    }
  };

  const handleDynamicCopagoChange = (planName: string, copagoType: string, value: string) => {
    if (isUpdating) return;
    
    setDynamicCopagoSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        const currentPlanSelections = newSelections[planName] || {
          altoCosto: "0",
          medicamentos: "0",
          habitacion: "0"
        };
        newSelections[planName] = {
          ...currentPlanSelections,
          [copagoType]: value
        };
      } else {
        planes.forEach(plan => {
          const currentPlanSelections = newSelections[plan.plan] || {
            altoCosto: "0",
            medicamentos: "0",
            habitacion: "0"
          };
          newSelections[plan.plan] = {
            ...currentPlanSelections,
            [copagoType]: value
          };
        });
      }
      
      return newSelections;
    });
    
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
  };

  // Estado derivado adicional
  const isEmpty = !cliente || planes.length === 0;

  const validateAndSaveToStore = useCallback(async (): Promise<boolean> => {
    try {
      // Actualizar todos los planes en el store
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
      
      return true;
    } catch (error) {
      console.error('Error al guardar coberturas:', error);
      return false;
    }
  }, [updatePlanOpcionales, planes, planSelections]);

  return {
    // Estados
    globalFilters,
    planSelections,
    coberturaSelections,
    copagoSelections,
    copagoHabitacionSelections,
    dynamicCoberturaSelections,
    dynamicCopagoSelections,
    planesData,
    cliente,
    planes,
    ODONTOLOGIA_OPTIONS: ODONTOLOGIA_OPTIONS,
    
    // Opciones dinámicas desde API
    dynamicAltoCostoOptions: altoCostoOptionsQuery.data || [],
    dynamicMedicamentosOptions: medicamentosOptionsQuery.data || [],
    dynamicHabitacionOptions: habitacionOptionsQuery.data || [],
    dynamicODONTOLOGIA_OPTIONS: ODONTOLOGIA_OPTIONSQuery.data || [],
    dynamicCopagosOptions: copagosQuery.data || [],
    dynamicCopagosAltoCostoOptions: copagosAltoCostoQuery.data || [],
    dynamicCopagosHabitacionOptions: copagosHabitacionQuery.data || [],
    
    // Estados derivados
    isLoading,
    hasError,
    isEmpty,
    
    // Handlers
    handleGlobalFilterChange,
    handleOdontologiaChange,
    handleCoberturaChange,
    handleCopagoChange,
    handleCopagoHabitacionChange,
    handleDynamicCoberturaChange,
    handleDynamicCopagoChange,
    
    // Navegación
    validateAndSaveToStore
  };
};

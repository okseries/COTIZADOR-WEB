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
import { updateSelectionsForClientType, updatePlansInStore } from '../../utils/handler.utils';

// Valores por defecto
const defaultCoberturaSelections: CoberturaSelections = {
  altoCosto: DEFAULT_SELECTION_VALUE,
  medicamentos: DEFAULT_SELECTION_VALUE, 
  habitacion: DEFAULT_SELECTION_VALUE,
  odontologia: DEFAULT_SELECTION_VALUE
};



// Datos estáticos para odontología
const odontologiaOptions: OdontologiaOption[] = [
  { value: "0", label: "Ninguna (No seleccionar)", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

// Helper: Detectar tipoOpcionalId automáticamente basado en el nombre
const detectTipoOpcionalId = (nombreOpcional: string): number => {
  switch (nombreOpcional.toUpperCase()) {
    case "MEDICAMENTOS":
    case "COPAGO MEDICAMENTOS":
      return 1;
    case "ALTO COSTO":
    case "COPAGO ALTO COSTO":
      return 3;
    case "HABITACION":
    case "HABITACIÓN":
    case "COPAGO HABITACIÓN":
    case "COPAGO HABITACION":
      return 2;
    case "ODONTOLOGIA":
    case "ODONTOLOGÍA":
      return 4;
    default:
      console.warn(`⚠️ Nombre de opcional no reconocido para detectar tipoOpcionalId: ${nombreOpcional}`);
      return 0; // Valor por defecto
  }
};

// Función auxiliar: Extraer información de descripción
const extractInfoFromDescription = (descripcion: string) => {
  const montoMatch = descripcion.match(/RD\$?([\d,]+(?:\.\d{2})?)/);
  const monto = montoMatch ? montoMatch[1].replace(/,/g, '').replace(/\.00$/, '') : null;
  
  const porcentajeMatch = descripcion.match(/al (\d+)%/);
  const porcentaje = porcentajeMatch ? (parseInt(porcentajeMatch[1]) / 100).toString() : null;
  
  return { monto, porcentaje };
};

// � FUNCIÓN SIMPLIFICADA: Mapeo directo usando originalOptId (solución arquitectónica correcta)
const mapCotizacionToOptId = (
  cotizacionOpcional: Opcional,
  catalogoOpciones: CoberturasOpcionaleColectivo[],
  cantidadAfiliados: number = 1
): string | null => {
  if (!catalogoOpciones || catalogoOpciones.length === 0) return null;
  
  // Prioridad 1: Mapeo directo por originalOptId
  if (cotizacionOpcional.originalOptId) {
    const match = catalogoOpciones.find(opt => opt.opt_id === cotizacionOpcional.originalOptId);
    return match ? match.opt_id.toString() : null;
  }
  
  // Fallback: Mapeo por descripción para cotizaciones legadas
  if (cotizacionOpcional.descripcion) {
    const { monto, porcentaje } = extractInfoFromDescription(cotizacionOpcional.descripcion);
    
    if (monto && porcentaje) {
      const match = catalogoOpciones.find(option => {
        return option.limit_price === monto && option.opt_percentage === porcentaje;
      });
      return match ? match.opt_id.toString() : null;
    }
  }
  
  return null;
};

export const useCoberturasOpcionales = () => {
  // Acceder directamente a los datos del store sin usar getFinalObject en cada render
  const { cliente, planes, updatePlanByName, mode } = useUnifiedQuotationStore();
  
  // Obtener el mode para detectar si estamos editando
  const isEditMode = mode !== "create";
  
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
  
  // Estados locales con tipado mejorado
  const [userHasModifiedFilters, setUserHasModifiedFilters] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    altoCosto: false,
    medicamentos: false,
    habitacion: false,
    odontologia: false
  });
  
  const [planSelections, setPlanSelections] = useState<PlanSelections>({});
  const [coberturaSelections, setCoberturaSelections] = useState<Record<string, CoberturaSelections>>({});
  const [planesData, setPlanesData] = useState<PlanesData>({});
  const [copagoSelections, setCopagoSelections] = useState<Record<string, string>>({});
  const [copagoHabitacionSelections, setCopagoHabitacionSelections] = useState<Record<string, string>>({});
  const [dynamicCoberturaSelections, setDynamicCoberturaSelections] = useState<DynamicCoberturaSelections>({});
  const [dynamicCopagoSelections, setDynamicCopagoSelections] = useState<DynamicCopagoSelectionsMap>({});
  const [isUpdating, setIsUpdating] = useState(false);
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
  
  // API parameters
  const tipoPlanParaAPI = cliente?.tipoPlan || 1;
  
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

  // Hooks para opciones dinámicas por tipo de cobertura (solo para colectivos)
  const isColectivo = cliente?.clientChoosen === 2;
  
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
  
  // Estados derivados para la UI
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

  // Combinar resultados en un array
  const planQueriesData: Array<{
    planName: string;
    data: CoberturasOpcional[] | null;
    isLoading: boolean;
    error: unknown;
  }> = useMemo(() => {
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
              const odontologiaMatch = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
              
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
          
          const staticOdontologiaMatch = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
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
          
          const staticOdontologiaMatch = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
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
                  
                  const matchingOption = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
                  
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
    odontologiaOptions
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

  const updatePlanOpcionales = useCallback((planName: string, odontologiaValue: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Obtener planesData actual del estado
    const planDataCurrent = planesData[planName];
    if (!planDataCurrent || !planDataCurrent[0]) {
      setIsUpdating(false);
      return;
    }

      const opcionales: Opcional[] = [];
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
    odontologiaOptions,
    isUpdating
  ]); // Agregar isUpdating como dependencia crítica

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

  // Estados derivados
  const isLoading = planQueriesData.some(q => q.isLoading);
  const hasError = planQueriesData.some(q => q.error);
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
    odontologiaOptions: ODONTOLOGIA_OPTIONS,
    
    // Opciones dinámicas desde API
    dynamicAltoCostoOptions: altoCostoOptionsQuery.data || [],
    dynamicMedicamentosOptions: medicamentosOptionsQuery.data || [],
    dynamicHabitacionOptions: habitacionOptionsQuery.data || [],
    dynamicOdontologiaOptions: odontologiaOptionsQuery.data || [],
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


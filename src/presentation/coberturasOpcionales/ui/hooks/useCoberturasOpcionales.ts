/**
 * 🎯 HOOK MEJORADO: useCoberturasOpcionales v4.0
 * 
 * SOLUCIÓN CRÍTICA - MAPEO CORRECTO DE INTENCIONES:
 * ✅ opt_id = ID del catálogo que enviamos (intención del usuario)
 * ✅ Backend re-mapea internamente a sus propios IDs
 * ✅ MAPEO POR COINCIDENCIA: limit_price + opt_percentage → opt_id (solo para UI)
 * ✅ ENVIAR INTENCIONES: Siempre enviar opt_ids del catálogo, no IDs guardados
 * 
 * FLUJO CORRECTO DESCUBIERTO:
 * 1. CREAR: Usuario selecciona → enviamos opt_id → backend calcula y asigna su ID
 * 2. EDITAR: Cotización tiene ID=39 → mapeamos a opt_id para mostrar → usuario cambia → enviamos nuevo opt_id
 * 3. BACKEND: Recibe opt_id → aplica lógica de negocio → asigna nuevo ID/prima/descripción
 * 4. RESULTADO: Backend NUNCA preserva nuestros IDs, siempre hace re-mapeo interno
 * 
 * 🚨 INSIGHT CLAVE: 
 * - Frontend envía INTENCIONES (opt_ids)
 * - Backend devuelve DECISIONES (IDs finales, primas reales, descripciones oficiales)
 * - NO intentar preservar IDs, solo comunicar lo que el usuario quiere
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { usePlanesOpcionales, useCoberturasOpcionalesByType, useCopagos } from '../../hooks/usePlanesOpcionales';
import { CoberturasOpcional, CoberturasOpcionaleColectivo, Copago } from '../../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { OdontologiaOption } from '../components/OdontologiaSelect';

// Definir el tipo para las selecciones de cobertura
interface CoberturaSelections {
  altoCosto: string;
  medicamentos: string;
  habitacion: string;
  odontologia: string;
}

// Valores por defecto para las selecciones de cobertura
const defaultCoberturaSelections: CoberturaSelections = {
  altoCosto: "0",
  medicamentos: "0", 
  habitacion: "0",
  odontologia: "0"
};



// Datos estáticos para odontología
const odontologiaOptions: OdontologiaOption[] = [
  { value: "0", label: "Ninguna (No seleccionar)", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

// 🆕 HELPER: Detectar tipoOpcionalId automáticamente basado en el nombre
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

// 🆕 FUNCIÓN ROBUSTA: Mapear de cotización guardada a opt_id del catálogo con múltiples estrategias
const mapCotizacionToOptId = (
  cotizacionOpcional: Opcional,
  catalogoOpciones: CoberturasOpcionaleColectivo[],
  cantidadAfiliados: number = 1
): string | null => {
  if (!catalogoOpciones || catalogoOpciones.length === 0) return null;
  
  console.log(`� MAPEO ROBUSTO ${cotizacionOpcional.nombre}:`, {
    cotizacionId: cotizacionOpcional.id,
    originalOptId: cotizacionOpcional.originalOptId || "no disponible",
    tipoOpcionalId: cotizacionOpcional.tipoOpcionalId,
    descripcion: cotizacionOpcional.descripcion,
    prima: cotizacionOpcional.prima,
    cantidadAfiliados
  });
  
  // 🎯 ESTRATEGIA 1: Si existe originalOptId (más confiable)
  if (cotizacionOpcional.originalOptId) {
    const matchByOriginalId = catalogoOpciones.find(opt => opt.opt_id === cotizacionOpcional.originalOptId);
    if (matchByOriginalId) {
      console.log(`✅ MAPEO por originalOptId: ${cotizacionOpcional.originalOptId}`);
      return matchByOriginalId.opt_id.toString();
    } else {
      console.warn(`⚠️ originalOptId ${cotizacionOpcional.originalOptId} no existe en catálogo actual`);
    }
  }
  
  // 🎯 ESTRATEGIA 2: Buscar por ID directo si existe en catálogo
  if (cotizacionOpcional.id) {
    const matchByDirectId = catalogoOpciones.find(opt => opt.opt_id === cotizacionOpcional.id);
    if (matchByDirectId) {
      console.log(`✅ MAPEO por ID directo: ${cotizacionOpcional.id}`);
      return matchByDirectId.opt_id.toString();
    }
  }
  
  // 🎯 ESTRATEGIA 3: Buscar por tipoOpcionalId si está disponible
  if (cotizacionOpcional.tipoOpcionalId) {
    const matchByType = catalogoOpciones.find(opt => opt.tipoOpcionalId === cotizacionOpcional.tipoOpcionalId);
    if (matchByType) {
      console.log(`✅ MAPEO por tipoOpcionalId: ${cotizacionOpcional.tipoOpcionalId} → opt_id=${matchByType.opt_id}`);
      return matchByType.opt_id.toString();
    }
  }
  
  // 🎯 ESTRATEGIA 4: Buscar por descripción (más preciso)
  if (cotizacionOpcional.descripcion) {
    const extractInfoFromDescription = (descripcion: string) => {
      const montoMatch = descripcion.match(/RD\$?([\d,]+(?:\.\d{2})?)/);
      const monto = montoMatch ? montoMatch[1].replace(/,/g, '').replace(/\.00$/, '') : null;
      
      const porcentajeMatch = descripcion.match(/al (\d+)%/);
      const porcentaje = porcentajeMatch ? (parseInt(porcentajeMatch[1]) / 100).toString() : null;
      
      return { monto, porcentaje };
    };
    
    const { monto, porcentaje } = extractInfoFromDescription(cotizacionOpcional.descripcion);
    
    if (monto && porcentaje) {
      const matchByDescription = catalogoOpciones.find(option => {
        const limitMatch = option.limit_price === monto;
        const percentageMatch = option.opt_percentage === porcentaje;
        return limitMatch && percentageMatch;
      });
      
      if (matchByDescription) {
        console.log(`✅ MAPEO por descripción: monto=${monto}, porcentaje=${porcentaje} → opt_id=${matchByDescription.opt_id}`);
        return matchByDescription.opt_id.toString();
      }
    }
    
    // 🎯 ESTRATEGIA 4B: Buscar por descripción similar (fuzzy matching)
    const matchByFuzzyDescription = catalogoOpciones.find(option => {
      const similarity = calculateDescriptionSimilarity(cotizacionOpcional.descripcion || '', option.descripcion || '');
      return similarity > 0.8; // 80% de similitud
    });
    
    if (matchByFuzzyDescription) {
      console.log(`✅ MAPEO por descripción similar: → opt_id=${matchByFuzzyDescription.opt_id}`);
      return matchByFuzzyDescription.opt_id.toString();
    }
  }
  
  // 🎯 ESTRATEGIA 5: Como último recurso, buscar por prima similar (menos confiable)
  const primaUnitaria = (cotizacionOpcional.prima || 0) / cantidadAfiliados;
  const matchByPrima = catalogoOpciones.find(option => {
    const primaAPI = parseFloat(option.opt_prima || "0");
    const diferencia = Math.abs(primaAPI - primaUnitaria);
    return diferencia < 1; // Tolerancia de 1 peso
  });
  
  if (matchByPrima) {
    console.log(`⚠️ MAPEO por prima (menos confiable): primaUnitaria=${primaUnitaria} → opt_id=${matchByPrima.opt_id}`);
    return matchByPrima.opt_id.toString();
  }
  
  console.error(`❌ NO SE PUDO MAPEAR cotización:`, {
    id: cotizacionOpcional.id,
    tipoOpcionalId: cotizacionOpcional.tipoOpcionalId,
    descripcion: cotizacionOpcional.descripcion,
    primaUnitaria,
    catalogoDisponible: catalogoOpciones.map(opt => ({
      opt_id: opt.opt_id,
      descripcion: opt.descripcion,
      prima: opt.opt_prima
    }))
  });
  
  return null;
};

// Función auxiliar para calcular similitud entre descripciones
const calculateDescriptionSimilarity = (desc1: string, desc2: string): number => {
  if (!desc1 || !desc2) return 0;
  
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const a = normalize(desc1);
  const b = normalize(desc2);
  
  if (a === b) return 1;
  
  // Calcular similitud por palabras comunes
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  const commonWords = wordsA.filter(word => wordsB.includes(word));
  
  return (commonWords.length * 2) / (wordsA.length + wordsB.length);
};

// 🆕 FUNCIÓN SIMPLIFICADA: Ya no necesitamos preservar IDs, solo mapear para UI
// Esta función queda por compatibilidad pero no se usa en el flujo principal
const mapOptIdToCotizacion = (
  optId: string,
  catalogoOpciones: CoberturasOpcionaleColectivo[],
  cotizacionOriginal: Opcional
): Partial<Opcional> => {
  const selectedOption = catalogoOpciones.find(opt => opt.opt_id.toString() === optId);
  
  if (!selectedOption) {
    console.warn(`⚠️ No se encontró opt_id ${optId} en catálogo`);
    return {};
  }
  
  // 🔄 SOLO retornar datos del catálogo, NO preservar IDs
  return {
    descripcion: selectedOption.descripcion,
    prima: parseFloat(selectedOption.opt_prima)
  };
};

export const useCoberturasOpcionales = () => {
  // Acceder directamente a los datos del store sin usar getFinalObject en cada render
  const { cliente, planes, updatePlanByName, mode } = useUnifiedQuotationStore();
  
  // Obtener el mode para detectar si estamos editando
  const isEditMode = mode !== "create";
  
  // Refs para controlar inicializaciones y evitar bucles
  const initializedRef = useRef(false);
  const editModeInitializedRef = useRef(false);
  const previousModeRef = useRef<number | "create" | undefined>(undefined);
  const odontologiaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationLoadedRef = useRef(false); // 🆕 Ref para detectar carga por navegación
  
  // Resetear refs SOLO cuando cambia el modo (create <-> edit)
  useEffect(() => {
    // Solo resetear si realmente cambió el modo, no en el primer render
    if (previousModeRef.current !== mode && previousModeRef.current !== undefined) {
      initializedRef.current = false;
      editModeInitializedRef.current = false;
      navigationLoadedRef.current = false; // 🆕 Reset navegación también
      console.log('🔄 MODO CAMBIÓ - Reseteando refs:', {
        previousMode: previousModeRef.current,
        newMode: mode
      });
    }
    previousModeRef.current = mode;
  }, [mode]); // Solo depender del modo, NO de planes.length
  
  // Estados locales
  const [userHasModifiedFilters, setUserHasModifiedFilters] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    altoCosto: false,
    medicamentos: false,
    habitacion: false,
    odontologia: false
  });
  
  const [planSelections, setPlanSelections] = useState<{[planName: string]: {[key: string]: string}}>({});
  const [coberturaSelections, setCoberturaSelections] = useState<{[planName: string]: CoberturaSelections}>({});
  const [planesData, setPlanesData] = useState<{[planName: string]: CoberturasOpcional[]}>({});
  const [copagoSelections, setCopagoSelections] = useState<{[planName: string]: string}>({});
  const [copagoHabitacionSelections, setCopagoHabitacionSelections] = useState<{[planName: string]: string}>({});
  
  // Nuevos estados para selecciones dinámicas desde la API
  const [dynamicCoberturaSelections, setDynamicCoberturaSelections] = useState<{
    [planName: string]: {
      altoCosto: string;
      medicamentos: string;
      habitacion: string;
      odontologia: string;
    }
  }>({});
  const [dynamicCopagoSelections, setDynamicCopagoSelections] = useState<{
    [planName: string]: {
      altoCosto: string;
      medicamentos: string;
      habitacion: string;
    }
  }>({});
  const handleCopagoHabitacionChange = (planName: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    // 🆕 LÓGICA DIFERENCIADA: 
    // - Colectivos: Solo actualizar el plan específico
    // - Individuales: Aplicar a todos los planes
    setCopagoHabitacionSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        newSelections[planName] = value;
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes existentes (comportamiento original)
        planes.forEach(plan => {
          newSelections[plan.plan] = value;
        });
      }
      
      return newSelections;
    });
    
    setTimeout(() => {
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        const odontologiaValue = planSelections[planName]?.odontologia || "0";
        updatePlanOpcionales(planName, odontologiaValue);
      } else {
        // INDIVIDUAL: Actualizar todos los planes
        planes.forEach(plan => {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        });
      }
    }, 100);
  };
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🚨 DEBUG CRÍTICO: Verificar parámetros de API antes de las consultas
  const tipoPlanParaAPI = cliente?.tipoPlan || 1;
  console.log('🌐 API QUERIES PARÁMETROS:', JSON.stringify({
    isColectivo: cliente?.clientChoosen === 2,
    clientChoosen: cliente?.clientChoosen,
    tipoPlanOriginal: cliente?.tipoPlan,
    tipoPlanParaAPI,
    esVoluntario: tipoPlanParaAPI === 1,
    esComplementario: tipoPlanParaAPI === 2,
    alertaFallback: cliente?.tipoPlan === undefined ? "⚠️ USANDO FALLBACK - PUEDE SER INCORRECTO" : "✅ tipoPlan definido"
  }, null, 2));
  
  const handleCopagoChange = (planName: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    // 🆕 LÓGICA DIFERENCIADA: 
    // - Colectivos: Solo actualizar el plan específico
    // - Individuales: Aplicar a todos los planes
    setCopagoSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        newSelections[planName] = value;
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes existentes (comportamiento original)
        planes.forEach(plan => {
          newSelections[plan.plan] = value;
        });
      }
      
      return newSelections;
    });
    
    setTimeout(() => {
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        const odontologiaValue = planSelections[planName]?.odontologia || "0";
        updatePlanOpcionales(planName, odontologiaValue);
      } else {
        // INDIVIDUAL: Actualizar todos los planes
        planes.forEach(plan => {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        });
      }
    }, 100);
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
  
  console.log('🔧 QUERIES HABILITADAS MEJORADAS:', {
    isColectivo,
    isEditMode,
    storeDetection: {
      hasAltoCostoInStore,
      hasMedicamentosInStore, 
      hasHabitacionInStore
    },
    shouldLoad: {
      altoCosto: shouldLoadAltoCosto,
      medicamentos: shouldLoadMedicamentos,
      habitacion: shouldLoadHabitacion,
      odontologia: shouldLoadOdontologia
    },
    globalFilters,
    reason: isEditMode ? "Modo edición - carga selectiva según store" : "Filtros globales activos"
  });
  
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

  // 🔍 DEBUG CRÍTICO: Log del estado de las queries
  console.log('🔍 QUERIES STATUS DETALLADO:', {
    altoCosto: {
      shouldLoad: shouldLoadAltoCosto,
      hasInStore: hasAltoCostoInStore,
      globalFilter: globalFilters.altoCosto,
      isEditMode,
      tipoPlan: cliente?.tipoPlan,
      isLoading: altoCostoOptionsQuery.isLoading,
      isError: altoCostoOptionsQuery.isError,
      dataLength: altoCostoOptionsQuery.data?.length || 0,
      error: altoCostoOptionsQuery.error
    },
    medicamentos: {
      shouldLoad: shouldLoadMedicamentos,
      hasInStore: hasMedicamentosInStore,
      globalFilter: globalFilters.medicamentos,
      isEditMode,
      isLoading: medicamentosOptionsQuery.isLoading,
      isError: medicamentosOptionsQuery.isError,
      dataLength: medicamentosOptionsQuery.data?.length || 0,
      error: medicamentosOptionsQuery.error
    },
    habitacion: {
      shouldLoad: shouldLoadHabitacion,
      hasInStore: hasHabitacionInStore,
      globalFilter: globalFilters.habitacion,
      isEditMode,
      isLoading: habitacionOptionsQuery.isLoading,
      isError: habitacionOptionsQuery.isError,
      dataLength: habitacionOptionsQuery.data?.length || 0,
      error: habitacionOptionsQuery.error
    },
    odontologia: {
      shouldLoad: shouldLoadOdontologia,
      globalFilter: globalFilters.odontologia,
      isEditMode,
      note: "Odontología es estática - no necesita carga dinámica en edición",
      isLoading: odontologiaOptionsQuery.isLoading,
      isError: odontologiaOptionsQuery.isError,
      dataLength: odontologiaOptionsQuery.data?.length || 0,
      error: odontologiaOptionsQuery.error
    }
  });

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
        console.log('🔄 DATOS DE API CAMBIARON - Permitiendo re-mapeo');
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
    
    console.log('🔄 INICIANDO MAPEO CORRECTO COTIZACIÓN → CATÁLOGO');
    
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
        // 🆕 DETECCIÓN AUTOMÁTICA: Si no hay tipoOpcionalId, detectarlo por nombre
        const tipoDetectado = opcional.tipoOpcionalId || detectTipoOpcionalId(opcional.nombre);
        
        switch (tipoDetectado) {
          case 3: // Alto Costo
            if (opcional.nombre === "ALTO COSTO" && altoCostoOptionsQuery.data) {
              const optId = mapCotizacionToOptId(opcional, altoCostoOptionsQuery.data, plan.cantidadAfiliados || 1);
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
                  console.log(`✅ COPAGO ALTO COSTO mapeado: Prima ${primaUnitaria} → ID ${copagoMatch.id}`);
                } else {
                  console.warn(`⚠️ No se encontró copago para prima ${primaUnitaria}`);
                }
              }
            }
            break;
            
          case 1: // Medicamentos
            if (opcional.nombre === "MEDICAMENTOS" && medicamentosOptionsQuery.data) {
              const optId = mapCotizacionToOptId(opcional, medicamentosOptionsQuery.data, plan.cantidadAfiliados || 1);
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
                  console.log(`✅ COPAGO MEDICAMENTOS mapeado: Prima ${primaUnitaria} → ID ${copagoMatch.id}`);
                } else {
                  console.warn(`⚠️ No se encontró copago medicamentos para prima ${primaUnitaria}`);
                }
              }
            }
            break;
            
          case 2: // Habitación
            if (opcional.nombre === "HABITACION" && habitacionOptionsQuery.data) {
              const optId = mapCotizacionToOptId(opcional, habitacionOptionsQuery.data, plan.cantidadAfiliados || 1);
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
                  console.log(`✅ COPAGO HABITACIÓN mapeado: Prima ${primaUnitaria} → ID ${copagoMatch.id}`);
                } else {
                  console.warn(`⚠️ No se encontró copago habitación para prima ${primaUnitaria}`);
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
      
      console.log(`✅ MAPEO COMPLETADO para ${plan.plan}:`, {
        selecciones: initialSelections[plan.plan],
        copagos: initialCopagos[plan.plan]
      });
    });
    
    // Aplicar las selecciones mapeadas
    setDynamicCoberturaSelections(initialSelections);
    setDynamicCopagoSelections(initialCopagos);
    
    console.log('🎯 MAPEO CORRECTO APLICADO:', {
      totalPlanes: planes.length,
      seleccionesTotales: Object.keys(initialSelections).length,
      copagosTotales: Object.keys(initialCopagos).length
    });
    
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
          
          console.log(`🦷 ODONTOLOGÍA - Prima unitaria: ${primaUnitaria}, Opciones estáticas:`, 
            odontologiaOptions.map(opt => ({ value: opt.value, label: opt.label, prima: opt.prima }))
          );
          
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
            // console.log(`🔄 MODO CREAR - NAVEGACIÓN: Plan ${plan.plan} - Restaurando odontología específica: ${odontologiaValue}`);
          } else {
            odontologiaValue = "0";
          }
        } else {
          // En modo crear SIN datos en el store: usar valor por defecto "0" específico por plan
          // console.log(`🦷 MODO CREAR: Plan ${plan.plan} - Usando valor por defecto "0"`);
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
    
    console.log('🎯 INICIALIZANDO FILTROS GLOBALES:', {
      clientChoosen: cliente?.clientChoosen,
      isEditMode,
      planesLength: planes.length,
      userHasModified: userHasModifiedFilters,
      firstPlanOpcionales: planes[0]?.opcionales.length || 0
    });
    
    if (cliente?.clientChoosen === 2) {
      // Para colectivos, leer las opcionales existentes para determinar qué filtros deben estar activos
      const firstPlan = planes[0];
      if (firstPlan && firstPlan.opcionales.length > 0) {
        const hasAltoCosto = firstPlan.opcionales.some(opt => opt.nombre === "ALTO COSTO");
        const hasMedicamentos = firstPlan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS");
        const hasHabitacion = firstPlan.opcionales.some(opt => opt.nombre === "HABITACION");
        const hasOdontologia = firstPlan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA");

        console.log('🔍 FILTROS DETECTADOS EN STORE:', {
          hasAltoCosto,
          hasMedicamentos,
          hasHabitacion,
          hasOdontologia,
          totalOpcionales: firstPlan.opcionales.length
        });

        setGlobalFilters({
          altoCosto: hasAltoCosto,
          medicamentos: hasMedicamentos,
          habitacion: hasHabitacion,
          odontologia: hasOdontologia
        });
        
        console.log('✅ FILTROS GLOBALES ACTUALIZADOS DESDE STORE');
      } else {
        // 🆕 MODO EDICIÓN SIN OPCIONALES: No forzar filtros, la detección selectiva se encarga
        if (isEditMode) {
          console.log('🔧 MODO EDICIÓN SIN OPCIONALES: Usando detección selectiva - no hay opcionales para cargar');
          setGlobalFilters({
            altoCosto: false,
            medicamentos: false,
            habitacion: false,
            odontologia: false
          });
        } else {
          console.log('🆕 MODO CREAR: Filtros desactivados hasta selección manual');
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
  
  // 🆕 EFECTO PARA NAVEGACIÓN ENTRE STEPS: Detectar y persistir/cargar TODAS las selecciones
  useEffect(() => {
    // 🔧 FIX NAVEGACIÓN: Detectar navegación de vuelta al Step 3 con lógica mejorada
    // Condición más específica: hay planes, pero estados vacíos Y hay datos en el store
    const isReturningToStep3 = planes.length > 0 && 
                               Object.keys(planSelections).length < planes.length &&
                               Object.keys(dynamicCoberturaSelections).length < planes.length &&
                               planes.some(plan => plan.opcionales.length > 0);
    
    // 🔍 DEBUG NAVEGACIÓN
    console.log('🔍 NAVEGACIÓN DEBUG:', JSON.stringify({
      planesLength: planes.length,
      planSelectionsLength: Object.keys(planSelections).length,
      dynamicCoberturaSelectionsLength: Object.keys(dynamicCoberturaSelections).length,
      copagoSelectionsLength: Object.keys(copagoSelections).length,
      isReturningToStep3,
      hasOpcionalesInStore: planes.some(plan => plan.opcionales.length > 0),
      planSelectionsKeys: Object.keys(planSelections),
      dynamicCoberturaKeys: Object.keys(dynamicCoberturaSelections),
      planesWithOpcionales: planes.map(plan => ({
        plan: plan.plan,
        opcionales: plan.opcionales.length,
        nombres: plan.opcionales.map(opt => opt.nombre)
      }))
    }, null, 2));
    
    if (isReturningToStep3) {
      const hasOpcionalesInStore = planes.some(plan => plan.opcionales.length > 0);
      
      if (hasOpcionalesInStore) {
        console.log('🔄 NAVEGACIÓN DETECTADA: Cargando selecciones específicas por plan desde store');
        
        // Forzar reinicialización resetando los refs
        initializedRef.current = false;
        editModeInitializedRef.current = false;
        
        // 🆕 CARGAR TODOS LOS ESTADOS desde el store
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
          
          console.log(`🔍 NAVEGACIÓN - Procesando plan: ${plan.plan}, opcionales: ${plan.opcionales.length}`);
          
          // 🆕 DEBUG ESPECÍFICO PARA FLEX SMART
          if (plan.plan.includes('FLEX SMART')) {
            console.log(`🚨 FLEX SMART DEBUG - Opcionales disponibles:`, JSON.stringify({
              planName: plan.plan,
              totalOpcionales: plan.opcionales.length,
              opcionalesNombres: plan.opcionales.map(opt => opt.nombre),
              tieneCopagos: plan.opcionales.filter(opt => opt.nombre.includes('COPAGO')),
              tieneCopagoHabitacion: plan.opcionales.some(opt => opt.nombre === 'COPAGO HABITACIÓN'),
              todosLosOpcionales: plan.opcionales.map(opt => ({
                nombre: opt.nombre,
                id: opt.id,
                idCopago: opt.idCopago,
                prima: opt.prima
              }))
            }, null, 2));
          }
          
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
          
          // 🔧 MAPEAR TODAS LAS SELECCIONES ESPECÍFICAS DE ESTE PLAN - MÉTODO DIRECTO
          plan.opcionales.forEach(opcional => {
            switch (opcional.nombre) {
              case "ALTO COSTO":
                if (opcional.id) {
                  // 🆕 MAPEO INTELIGENTE: Buscar opción correcta en API por prima similar
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const opcionAPI = altoCostoOptionsQuery.data?.find(opt => {
                    const primaAPI = parseFloat(opt.opt_prima || "0");
                    const diferencia = Math.abs(primaAPI - primaUnitaria);
                    return diferencia < 1; // Tolerancia de 1 peso
                  });
                  
                  if (opcionAPI) {
                    initialDynamicCoberturaSelections[plan.plan].altoCosto = opcionAPI.opt_id.toString();
                    console.log(`✅ MAPEO ALTO COSTO EXITOSO - ${plan.plan}: Store ID ${opcional.id} → API ID ${opcionAPI.opt_id} (Prima: ${primaUnitaria} ≈ ${opcionAPI.opt_prima})`);
                  } else {
                    // Fallback: usar el primer elemento disponible
                    const primerOpcion = altoCostoOptionsQuery.data?.[0];
                    if (primerOpcion) {
                      initialDynamicCoberturaSelections[plan.plan].altoCosto = primerOpcion.opt_id.toString();
                      console.log(`⚠️ MAPEO ALTO COSTO FALLBACK - ${plan.plan}: Store ID ${opcional.id} → API ID ${primerOpcion.opt_id} (primera opción disponible)`);
                    } else {
                      initialDynamicCoberturaSelections[plan.plan].altoCosto = opcional.id.toString();
                      console.log(`❌ NO SE PUDO MAPEAR ALTO COSTO - ${plan.plan}: Usando ID original ${opcional.id}`);
                    }
                  }
                  
                  detectedFilters.altoCosto = true;
                  
                  const tipoOpcionalId = opcional.tipoOpcionalId || detectTipoOpcionalId(opcional.nombre);
                }
                break;
                
              case "COPAGO ALTO COSTO":
                // ✅ USAR idCopago directamente (es el ID correcto de la API)
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].altoCosto = opcional.idCopago.toString();
                } else if (opcional.prima && copagosAltoCostoQuery.data) {
                  // 🔧 NAVEGACIÓN: Mapear por prima para obtener el ID correcto de la API
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const copagoAPI = copagosAltoCostoQuery.data.find(copago => {
                    const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                    const diferencia = Math.abs(precioAPI - primaUnitaria);
                    return diferencia < 1;
                  });
                  
                  if (copagoAPI) {
                    initialDynamicCopagoSelections[plan.plan].altoCosto = copagoAPI.id.toString();
                    console.log(`✅ NAVEGACIÓN - Copago Alto Costo mapeado por prima para ${plan.plan}: Prima ${primaUnitaria} → API ID ${copagoAPI.id}`);
                  } else {
                    // Fallback: usar el primer elemento disponible
                    const primerCopago = copagosAltoCostoQuery.data?.[0];
                    if (primerCopago) {
                      initialDynamicCopagoSelections[plan.plan].altoCosto = primerCopago.id.toString();
                      console.log(`⚠️ NAVEGACIÓN - Copago Alto Costo fallback para ${plan.plan}: → API ID ${primerCopago.id}`);
                    }
                  }
                } else if (opcional.id) {
                  // 🔧 FALLBACK: Usar ID si no hay prima ni idCopago
                  initialDynamicCopagoSelections[plan.plan].altoCosto = opcional.id.toString();
                  console.log(`🔧 NAVEGACIÓN - Copago Alto Costo usando ID fallback para ${plan.plan}: ${opcional.id}`);
                }
                break;
                
              case "MEDICAMENTOS":
                if (opcional.id) {
                  // 🆕 MAPEO INTELIGENTE: Buscar opción correcta en API por prima similar
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const opcionAPI = medicamentosOptionsQuery.data?.find(opt => {
                    const primaAPI = parseFloat(opt.opt_prima || "0");
                    const diferencia = Math.abs(primaAPI - primaUnitaria);
                    return diferencia < 1;
                  });
                  
                  if (opcionAPI) {
                    initialDynamicCoberturaSelections[plan.plan].medicamentos = opcionAPI.opt_id.toString();
                    console.log(`✅ MAPEO MEDICAMENTOS EXITOSO - ${plan.plan}: Store ID ${opcional.id} → API ID ${opcionAPI.opt_id} (Prima: ${primaUnitaria} ≈ ${opcionAPI.opt_prima})`);
                  } else {
                    // Para medicamentos, mantener el ID original ya que tiene coincidencia según los logs
                    initialDynamicCoberturaSelections[plan.plan].medicamentos = opcional.id.toString();
                    console.log(`⚠️ MAPEO MEDICAMENTOS DIRECTO - ${plan.plan}: Usando ID original ${opcional.id} (tiene coincidencia en logs)`);
                  }
                  
                  detectedFilters.medicamentos = true;
                  
                  console.log(`💊 NAVEGACIÓN - Medicamentos cargado para ${plan.plan}:`, JSON.stringify({
                    planName: plan.plan,
                    originalId: opcional.id,
                    mappedId: initialDynamicCoberturaSelections[plan.plan].medicamentos,
                    tipoOpcionalId: opcional.tipoOpcionalId || 'N/A',
                    prima: opcional.prima,
                    primaUnitaria,
                    mensaje: "🔧 MAPEO POR PRIMA SIMILAR"
                  }, null, 2));
                }
                break;
                
              case "COPAGO MEDICAMENTOS":
                // ✅ USAR idCopago directamente (es el ID correcto de la API)
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].medicamentos = opcional.idCopago.toString();
                  console.log(`✅ NAVEGACIÓN - Copago Medicamentos usando idCopago para ${plan.plan}: ${opcional.idCopago}`);
                } else if (opcional.prima && copagosQuery.data) {
                  // 🔧 NAVEGACIÓN: Mapear por prima para obtener el ID correcto de la API
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const copagoAPI = copagosQuery.data.find(copago => {
                    const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                    const diferencia = Math.abs(precioAPI - primaUnitaria);
                    return diferencia < 1;
                  });
                  
                  if (copagoAPI) {
                    initialDynamicCopagoSelections[plan.plan].medicamentos = copagoAPI.id.toString();
                    console.log(`✅ NAVEGACIÓN - Copago Medicamentos mapeado por prima para ${plan.plan}: Prima ${primaUnitaria} → API ID ${copagoAPI.id}`);
                  } else {
                    // Fallback: usar el primer elemento disponible
                    const primerCopago = copagosQuery.data?.[0];
                    if (primerCopago) {
                      initialDynamicCopagoSelections[plan.plan].medicamentos = primerCopago.id.toString();
                      console.log(`⚠️ NAVEGACIÓN - Copago Medicamentos fallback para ${plan.plan}: → API ID ${primerCopago.id}`);
                    }
                  }
                } else if (opcional.id) {
                  // 🔧 FALLBACK: Usar ID si no hay prima ni idCopago
                  initialDynamicCopagoSelections[plan.plan].medicamentos = opcional.id.toString();
                  console.log(`🔧 NAVEGACIÓN - Copago Medicamentos usando ID fallback para ${plan.plan}: ${opcional.id}`);
                }
                break;
                
              case "HABITACION":
                if (opcional.id) {
                  // 🆕 MAPEO INTELIGENTE: Buscar opción correcta en API por prima similar
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const opcionAPI = habitacionOptionsQuery.data?.find(opt => {
                    const primaAPI = parseFloat(opt.opt_prima || "0");
                    const diferencia = Math.abs(primaAPI - primaUnitaria);
                    return diferencia < 1;
                  });
                  
                  if (opcionAPI) {
                    initialDynamicCoberturaSelections[plan.plan].habitacion = opcionAPI.opt_id.toString();
                    console.log(`✅ MAPEO HABITACIÓN EXITOSO - ${plan.plan}: Store ID ${opcional.id} → API ID ${opcionAPI.opt_id} (Prima: ${primaUnitaria} ≈ ${opcionAPI.opt_prima})`);
                  } else {
                    // Fallback: usar el primer elemento disponible
                    const primerOpcion = habitacionOptionsQuery.data?.[0];
                    if (primerOpcion) {
                      initialDynamicCoberturaSelections[plan.plan].habitacion = primerOpcion.opt_id.toString();
                      console.log(`⚠️ MAPEO HABITACIÓN FALLBACK - ${plan.plan}: Store ID ${opcional.id} → API ID ${primerOpcion.opt_id} (primera opción disponible)`);
                    } else {
                      initialDynamicCoberturaSelections[plan.plan].habitacion = opcional.id.toString();
                      console.log(`❌ NO SE PUDO MAPEAR HABITACIÓN - ${plan.plan}: Usando ID original ${opcional.id}`);
                    }
                  }
                  
                  detectedFilters.habitacion = true;
                  
                  console.log(`🏠 NAVEGACIÓN - Habitación cargado para ${plan.plan}:`, JSON.stringify({
                    planName: plan.plan,
                    originalId: opcional.id,
                    mappedId: initialDynamicCoberturaSelections[plan.plan].habitacion,
                    tipoOpcionalId: opcional.tipoOpcionalId || 'N/A',
                    prima: opcional.prima,
                    primaUnitaria,
                    mensaje: "🔧 MAPEO POR PRIMA SIMILAR"
                  }, null, 2));
                }
                break;
                
              case "COPAGO HABITACIÓN":
                // ✅ USAR idCopago directamente (es el ID correcto de la API)
                if (opcional.idCopago) {
                  initialDynamicCopagoSelections[plan.plan].habitacion = opcional.idCopago.toString();
                  console.log(`✅ NAVEGACIÓN - Copago Habitación usando idCopago para ${plan.plan}: ${opcional.idCopago}`);
                } else if (opcional.prima && copagosHabitacionQuery.data) {
                  // 🔧 NAVEGACIÓN: Mapear por prima para obtener el ID correcto de la API
                  const primaUnitaria = (opcional.prima || 0) / (plan.cantidadAfiliados || 1);
                  const copagoAPI = copagosHabitacionQuery.data.find(copago => {
                    const precioAPI = typeof copago.price === 'string' ? parseFloat(copago.price) : copago.price;
                    const diferencia = Math.abs(precioAPI - primaUnitaria);
                    return diferencia < 1;
                  });
                  
                  if (copagoAPI) {
                    initialDynamicCopagoSelections[plan.plan].habitacion = copagoAPI.id.toString();
                    console.log(`✅ NAVEGACIÓN - Copago Habitación mapeado por prima para ${plan.plan}: Prima ${primaUnitaria} → API ID ${copagoAPI.id}`);
                  } else {
                    // Fallback: usar el primer elemento disponible
                    const primerCopago = copagosHabitacionQuery.data?.[0];
                    if (primerCopago) {
                      initialDynamicCopagoSelections[plan.plan].habitacion = primerCopago.id.toString();
                      console.log(`⚠️ NAVEGACIÓN - Copago Habitación fallback para ${plan.plan}: → API ID ${primerCopago.id}`);
                    }
                  }
                } else if (opcional.id) {
                  // 🔧 FALLBACK: Usar ID si no hay prima ni idCopago
                  initialDynamicCopagoSelections[plan.plan].habitacion = opcional.id.toString();
                  console.log(`🔧 NAVEGACIÓN - Copago Habitación usando ID fallback para ${plan.plan}: ${opcional.id}`);
                }
                break;
                
              case "ODONTOLOGIA":
              case "ODONTOLOGÍA":
                // 🆕 ODONTOLOGÍA ESPECÍFICA POR PLAN en colectivos
                if (opcional.prima) {
                  // 🔧 MEJORAR DETECCIÓN: Usar prima unitaria para colectivos
                  const cantidadAfiliados = plan.cantidadAfiliados || 1;
                  const primaUnitaria = opcional.prima / cantidadAfiliados;
                  
                  console.log(`🦷 NAVEGACIÓN - Detectando odontología para ${plan.plan}:`, JSON.stringify({
                    primaTotal: opcional.prima,
                    cantidadAfiliados,
                    primaUnitaria,
                    opcionesDisponibles: odontologiaOptions.map(opt => ({ value: opt.value, label: opt.label, prima: opt.prima }))
                  }, null, 2));
                  
                  // 🔧 FIX CRÍTICO: Buscar por prima unitaria con tolerancia MUY ESTRICTA para navegación
                  const matchingOption = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
                  
                  if (matchingOption) {
                    initialPlanSelections[plan.plan].odontologia = matchingOption.value;
                    console.log(`✅ NAVEGACIÓN - Odontología detectada para ${plan.plan}:`, JSON.stringify({
                      optionFound: {
                        value: matchingOption.value,
                        label: matchingOption.label,
                        prima: matchingOption.prima
                      },
                      primaUnitaria,
                      diferencia: Math.abs(matchingOption.prima - primaUnitaria)
                    }, null, 2));
                  } else {
                    console.log(`⚠️ NAVEGACIÓN - No se encontró coincidencia para ${plan.plan}:`, JSON.stringify({
                      primaUnitaria,
                      primaTotal: opcional.prima,
                      cantidadAfiliados,
                      opcionesDisponibles: odontologiaOptions.map(opt => ({
                        value: opt.value,
                        prima: opt.prima,
                        diferencia: Math.abs(opt.prima - primaUnitaria)
                      }))
                    }, null, 2));
                    
                    
                    // Fallback: intentar buscar por prima total directamente con tolerancia estricta
                    const directMatch = odontologiaOptions.find(opt => Math.abs(opt.prima - opcional.prima) < 1);
                    if (directMatch) {
                      initialPlanSelections[plan.plan].odontologia = directMatch.value;
                      console.log(`✅ NAVEGACIÓN - Odontología detectada (fallback) para ${plan.plan}:`, JSON.stringify({
                        fallbackOption: {
                          value: directMatch.value,
                          label: directMatch.label,
                          prima: directMatch.prima
                        },
                        primaTotal: opcional.prima,
                        diferencia: Math.abs(directMatch.prima - opcional.prima)
                      }, null, 2));
                    } else {
                      console.log(`❌ NAVEGACIÓN - Fallback fallido para ${plan.plan}:`, JSON.stringify({
                        primaTotal: opcional.prima,
                        primaUnitaria,
                        cantidadAfiliados,
                        todasLasOpciones: odontologiaOptions.map(opt => ({
                          value: opt.value,
                          prima: opt.prima,
                          diferenciaUnitaria: Math.abs(opt.prima - primaUnitaria),
                          diferenciaTotal: Math.abs(opt.prima - opcional.prima)
                        }))
                      }, null, 2));
                    } 
                  }
                  detectedFilters.odontologia = true;
                }
                break;
            }
          });
        });
        
        // Aplicar todos los estados cargados
        setPlanSelections(initialPlanSelections);
        setDynamicCoberturaSelections(initialDynamicCoberturaSelections);
        setDynamicCopagoSelections(initialDynamicCopagoSelections);
        
        // 🚨 FIX CRÍTICO: También aplicar los estados de copago que faltaban
        setCopagoSelections(initialCopagoSelections);
        setCopagoHabitacionSelections(initialCopagoHabitacionSelections);
        
        // 🆕 DEBUG ESPECÍFICO: Verificar qué copagos de habitación se están aplicando
        console.log('🏠 NAVEGACIÓN - Verificando copagos de habitación aplicados:', JSON.stringify({
          timestamp: new Date().toISOString(),
          copagosPorPlan: Object.entries(initialDynamicCopagoSelections).map(([planName, copagos]) => ({
            planName,
            copagoHabitacion: copagos.habitacion,
            tieneCopago: copagos.habitacion !== "0",
            esFlexSmart: planName.includes('FLEX SMART')
          })),
          flexSmartStatus: Object.entries(initialDynamicCopagoSelections)
            .filter(([planName]) => planName.includes('FLEX SMART'))
            .map(([planName, copagos]) => ({
              planName,
              copagoHabitacion: copagos.habitacion,
              mensaje: copagos.habitacion !== "0" ? "✅ FLEX SMART tiene copago habitación" : "❌ FLEX SMART SIN copago habitación"
            }))
        }, null, 2));
        
        // 🔍 DEBUG: Verificar que se están aplicando las selecciones de odontología
        console.log('🔍 NAVEGACIÓN - Aplicando selecciones de planSelections:', JSON.stringify({
          initialPlanSelections,
          odontologiaPorPlan: Object.entries(initialPlanSelections).map(([plan, sel]) => ({
            plan,
            odontologia: sel.odontologia
          }))
        }, null, 2));
        
        // Activar filtros globales basados en lo encontrado
        setGlobalFilters(detectedFilters);
        
        // 🆕 Marcar que hemos cargado desde navegación para evitar mapeo con tipoOpcionalId
        navigationLoadedRef.current = true;
        
        // 🔍 VERIFICACIÓN FINAL: Mostrar qué se está cargando vs API disponible
        console.log('🔍 NAVEGACIÓN - VERIFICACIÓN FINAL DE IDs CARGADOS:', JSON.stringify({
          timestamp: new Date().toISOString(),
          planCompareInfo: planes.map(plan => {
            const dynamicSelections = initialDynamicCoberturaSelections[plan.plan];
            return {
              planName: plan.plan,
              habitacionStoreId: dynamicSelections?.habitacion || "N/A",
              altoCostoStoreId: dynamicSelections?.altoCosto || "N/A", 
              medicamentosStoreId: dynamicSelections?.medicamentos || "N/A",
              mensaje: "Estos IDs vienen DIRECTOS del store - NO de mapeo por prima"
            };
          })
        }, null, 2));
        
        
      }
    }
  }, [
    planes.length, 
    planSelections, 
    dynamicCoberturaSelections, 
    copagoSelections, 
    odontologiaOptions
    // 🆕 ELIMINADAS DEPENDENCIAS DE API: Usamos IDs directos del store en navegación
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
    
    // 🆕 FIX CRÍTICO: Si acabamos de cargar desde navegación, NO ejecutar mapeo con tipoOpcionalId
    if (!allOptionsLoaded || 
        (editModeInitializedRef.current && hasValidPlanSpecificSelections) ||
        navigationLoadedRef.current) {
      
      console.log('🚫 MAPEO CON tipoOpcionalId BLOQUEADO:', JSON.stringify({
        allOptionsLoaded,
        editModeInitialized: editModeInitializedRef.current,
        hasValidPlanSpecificSelections,
        navigationLoaded: navigationLoadedRef.current,
        razon: !allOptionsLoaded ? "Options no cargadas" : 
               editModeInitializedRef.current && hasValidPlanSpecificSelections ? "Ya inicializado con selecciones válidas" :
               navigationLoadedRef.current ? "Acabamos de cargar desde navegación" : "Desconocida"
      }, null, 2));
      
      return;
    }
    
    // 🚨 ALERTA CRÍTICA: Si llegamos aquí después de navegación, es un problema
    console.log('⚠️ MAPEO CON tipoOpcionalId EJECUTÁNDOSE - POSIBLE PROBLEMA:', JSON.stringify({
      timestamp: new Date().toISOString(),
      allOptionsLoaded,
      editModeInitialized: editModeInitializedRef.current,
      hasValidPlanSpecificSelections,
      navigationLoaded: navigationLoadedRef.current,
      currentDynamicSelections: Object.entries(dynamicCoberturaSelections).map(([plan, sel]) => ({
        plan,
        altoCosto: sel.altoCosto,
        medicamentos: sel.medicamentos,
        habitacion: sel.habitacion
      })),
      alertaMsg: "⚠️ ESTE MAPEO PUEDE SOBRESCRIBIR LAS SELECCIONES DE NAVEGACIÓN"
    }, null, 2));
    
    // console.log('🚀 INICIANDO MAPEO INTELIGENTE - Todas las opciones cargadas');
    
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
        
        // 🆕 MAPEO MEJORADO CON tipoOpcionalId: Mapear directamente usando los IDs del store
        opcionales.forEach(opcional => {
          console.log(`🔍 Procesando opcional: ${opcional.nombre}, ID: ${opcional.id}, tipoOpcionalId: ${opcional.tipoOpcionalId || 'N/A'}`);
          
          if (opcional.nombre === "ALTO COSTO" && opcional.id) {
            // 🆕 USAR tipoOpcionalId PARA MAPEO DIRECTO
            if (opcional.tipoOpcionalId) {
              // Verificar que el tipoOpcionalId coincida con el tipo correcto (3 = ALTO COSTO)
              if (opcional.tipoOpcionalId === 3) {
                selections.altoCosto = opcional.id.toString();
                console.log(`💰 ALTO COSTO - Mapeo directo con tipoOpcionalId: ${opcional.tipoOpcionalId} -> ID: ${opcional.id}`);
              } else {
                console.warn(`💰 ALTO COSTO - tipoOpcionalId incorrecto: ${opcional.tipoOpcionalId}, esperado: 3`);
                selections.altoCosto = opcional.id.toString(); // Usar ID de todas formas
              }
            } else {
              // Fallback: usar ID directo del store (comportamiento anterior)
              selections.altoCosto = opcional.id.toString();
              console.log(`💰 ALTO COSTO - Fallback sin tipoOpcionalId, usando ID del store: ${opcional.id}`);
            }
          } else if (opcional.nombre === "COPAGO ALTO COSTO" && opcional.idCopago) {
            // Mapear copago de alto costo directamente
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].altoCosto = opcional.idCopago.toString();
            console.log(`💰 COPAGO ALTO COSTO - Mapeo directo: idCopago ${opcional.idCopago}`);
          } else if (opcional.nombre === "MEDICAMENTOS" && opcional.id) {
            // 🆕 USAR tipoOpcionalId PARA MAPEO DIRECTO
            if (opcional.tipoOpcionalId) {
              // Verificar que el tipoOpcionalId coincida con el tipo correcto (1 = MEDICAMENTOS)
              if (opcional.tipoOpcionalId === 1) {
                selections.medicamentos = opcional.id.toString();
                console.log(`💊 MEDICAMENTOS - Mapeo directo con tipoOpcionalId: ${opcional.tipoOpcionalId} -> ID: ${opcional.id}`);
              } else {
                console.warn(`💊 MEDICAMENTOS - tipoOpcionalId incorrecto: ${opcional.tipoOpcionalId}, esperado: 1`);
                selections.medicamentos = opcional.id.toString(); // Usar ID de todas formas
              }
            } else {
              // Fallback: usar ID directo del store (comportamiento anterior)
              selections.medicamentos = opcional.id.toString();
              console.log(`💊 MEDICAMENTOS - Fallback sin tipoOpcionalId, usando ID del store: ${opcional.id}`);
            }
          } else if (opcional.nombre === "COPAGO MEDICAMENTOS" && opcional.idCopago) {
            // Mapear copago de medicamentos directamente
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].medicamentos = opcional.idCopago.toString();
            console.log(`💊 COPAGO MEDICAMENTOS - Mapeo directo: idCopago ${opcional.idCopago}`);
          } else if (opcional.nombre === "HABITACION" && opcional.id) {
            // 🆕 USAR tipoOpcionalId PARA MAPEO DIRECTO
            if (opcional.tipoOpcionalId) {
              // Verificar que el tipoOpcionalId coincida con el tipo correcto (2 = HABITACION)
              if (opcional.tipoOpcionalId === 2) {
                selections.habitacion = opcional.id.toString();
                console.log(`🏠 HABITACIÓN - Mapeo directo con tipoOpcionalId: ${opcional.tipoOpcionalId} -> ID: ${opcional.id}`);
              } else {
                console.warn(`🏠 HABITACIÓN - tipoOpcionalId incorrecto: ${opcional.tipoOpcionalId}, esperado: 2`);
                selections.habitacion = opcional.id.toString(); // Usar ID de todas formas
              }
            } else {
              // Fallback: usar ID directo del store (comportamiento anterior)
              selections.habitacion = opcional.id.toString();
              console.log(`🏠 HABITACIÓN - Fallback sin tipoOpcionalId, usando ID del store: ${opcional.id}`);
            }
          } else if (opcional.nombre === "COPAGO HABITACIÓN" && opcional.idCopago) {
            // Mapear copago de habitación directamente
            if (!newDynamicCopagoSelections[plan.plan]) {
              newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
            }
            newDynamicCopagoSelections[plan.plan].habitacion = opcional.idCopago.toString();
            console.log(`🏠 COPAGO HABITACIÓN - Mapeo directo: idCopago ${opcional.idCopago}`);
          }
        });
        
        // console.log(`✅ Selecciones detectadas para ${plan.plan}:`, {
        //   altoCosto: selections.altoCosto,
        //   medicamentos: selections.medicamentos,
        //   habitacion: selections.habitacion,
        //   odontologia: selections.odontologia
        // });
        // console.log(`💰 Copagos detectados para ${plan.plan}:`, newDynamicCopagoSelections[plan.plan]);
        
        newDynamicSelections[plan.plan] = selections;
        hasChanges = true;
      }
    });
    
    // Actualizar estado solo si hay cambios reales
    if (hasChanges) {
      // console.log('🔄 Actualizando selecciones dinámicas desde store:', {
      //   totalPlanes: Object.keys(newDynamicSelections).length,
      //   selecciones: Object.entries(newDynamicSelections).map(([plan, sel]) => ({
      //     plan,
      //     habitacion: sel.habitacion,
      //     altoCosto: sel.altoCosto,
      //     medicamentos: sel.medicamentos,
      //     odontologia: sel.odontologia
      //   }))
      // });
      
      // console.log('🔧 APLICANDO MAPEO CORREGIDO - Selecciones después del mapeo temporal:', {
      //   newDynamicSelections: Object.entries(newDynamicSelections).map(([plan, sel]) => ({
      //     plan,
      //     habitacion: `${sel.habitacion} (era ${plan})`,
      //     altoCosto: `${sel.altoCosto} (era ${plan})`, 
      //     medicamentos: `${sel.medicamentos} (era ${plan})`
      //   }))
      // });
      
      setDynamicCoberturaSelections(prev => ({ 
        ...prev, 
        ...newDynamicSelections 
      }));

      // 🔍 DEBUG CRÍTICO: Verificar estado inmediatamente después de la actualización
      // console.log('🚨 ESTADO DESPUÉS DE ACTUALIZAR dynamicCoberturaSelections:', {
      //   timestamp: new Date().toISOString(),
      //   estadoAnterior: 'prev',
      //   nuevasSelecciones: Object.entries(newDynamicSelections).map(([plan, sel]) => ({
      //     plan,
      //     habitacion: sel.habitacion,
      //     altoCosto: sel.altoCosto,
      //     medicamentos: sel.medicamentos,
      //     odontologia: sel.odontologia
      //   })),
      //   totalPlanes: Object.keys(newDynamicSelections).length
      // });

      // 🔍 DEBUG: Confirmar que el estado se actualizó correctamente
      // setTimeout(() => {
      //   console.log('🔍 VERIFICACIÓN FINAL - Estado actualizado:', {
      //     timestamp: new Date().toISOString(),
      //     newDynamicSelections: Object.entries(newDynamicSelections).map(([plan, sel]) => ({
      //       plan,
      //       habitacion: sel.habitacion,
      //       altoCosto: sel.altoCosto,
      //       medicamentos: sel.medicamentos
      //     }))
      //   });
      // }, 100);

      // 🚨 FIX QUIRÚRGICO: Forzar actualización de filtros globales basado en las selecciones detectadas
      const hasAnyAltoCosto = Object.values(newDynamicSelections).some(sel => sel.altoCosto !== '');
      const hasAnyMedicamentos = Object.values(newDynamicSelections).some(sel => sel.medicamentos !== '');
      const hasAnyHabitacion = Object.values(newDynamicSelections).some(sel => sel.habitacion !== '');
      
      // 🦷 FIX ODONTOLOGÍA: Verificar si hay odontología en el store directamente desde las opcionales
      const hasAnyOdontologia = planes.some(plan => 
        plan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA")
      );

      // console.log('🎯 FIX QUIRÚRGICO: Actualizando filtros globales desde selecciones dinámicas:', {
      //   hasAnyAltoCosto,
      //   hasAnyMedicamentos, 
      //   hasAnyHabitacion,
      //   hasAnyOdontologia,
      //   odontologiaDetectadaEnStore: hasAnyOdontologia
      // });

      setGlobalFilters(prev => ({
        ...prev,
        altoCosto: hasAnyAltoCosto,
        medicamentos: hasAnyMedicamentos,
        habitacion: hasAnyHabitacion,
        odontologia: hasAnyOdontologia
      }));

      // 🔍 DEBUG: Verificar que las opciones dinámicas se están cargando
      // setTimeout(() => {
      //   // console.log('🔍 DEBUG: Verificando opciones dinámicas cargadas:', {
      //   //   habitacionOptions: habitacionOptionsQuery.data?.length || 0,
      //   //   altoCostoOptions: altoCostoOptionsQuery.data?.length || 0,
      //   //   medicamentosOptions: medicamentosOptionsQuery.data?.length || 0,
      //   //   habitacionEnabled: isColectivo && (globalFilters.habitacion || isEditMode),
      //   //   isEditMode,
      //   //   isColectivo
      //   // });

      //   // 🚨 DEBUG ADICIONAL: Verificar el estado de los queries
      //   // console.log('🔍 DEBUG QUERIES STATUS:', {
      //   //   habitacion: {
      //   //     isLoading: habitacionOptionsQuery.isLoading,
      //   //     isError: habitacionOptionsQuery.isError,
      //   //     error: habitacionOptionsQuery.error,
      //   //     enabled: isColectivo && (globalFilters.habitacion || isEditMode),
      //   //     dataLength: habitacionOptionsQuery.data?.length || 0
      //   //   },
      //   //   altoCosto: {
      //   //     isLoading: altoCostoOptionsQuery.isLoading,
      //   //     isError: altoCostoOptionsQuery.isError,
      //   //     error: altoCostoOptionsQuery.error,
      //   //     enabled: isColectivo && (globalFilters.altoCosto || isEditMode),
      //   //     dataLength: altoCostoOptionsQuery.data?.length || 0
      //   //   },
      //   //   medicamentos: {
      //   //     isLoading: medicamentosOptionsQuery.isLoading,
      //   //     isError: medicamentosOptionsQuery.isError,
      //   //     error: medicamentosOptionsQuery.error,
      //   //     enabled: isColectivo && (globalFilters.medicamentos || isEditMode),
      //   //     dataLength: medicamentosOptionsQuery.data?.length || 0
      //   //   }
      //   // });

      // }, 500);
    }
    
    if (Object.keys(newDynamicCopagoSelections).length > 0) {
      setDynamicCopagoSelections(prev => ({ 
        ...prev, 
        ...newDynamicCopagoSelections 
      }));
    }
    
    editModeInitializedRef.current = true; // Marcar como inicializado
    // 🚫 NO RESETEAR navigationLoadedRef aquí - debe mantenerse hasta nueva selección manual
    console.log(`✅ MAPEO MEJORADO CON tipoOpcionalId COMPLETADO - navigationLoadedRef se mantiene activo para prevenir re-ejecución`);
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
    
    console.log(`🔄 updatePlanOpcionales INICIADO:`, JSON.stringify({
      planName,
      odontologiaValue,
      isUpdating,
      dynamicSelections: dynamicCoberturaSelections[planName] || {},
      dynamicCopagos: dynamicCopagoSelections[planName] || {}
    }, null, 2));
    
    // 🔍 VERIFICACIÓN CRÍTICA: Verificar IDs que se están usando en modo edición vs crear
    console.log('🔍 VERIFICACIÓN FRONTED - ANÁLISIS DE IDs:', JSON.stringify({
      timestamp: new Date().toISOString(),
      modo: isEditMode ? "EDICIÓN" : "CREAR",
      planName,
      opcionalesEnStore: planes.find(p => p.plan === planName)?.opcionales?.map(opt => ({
        nombre: opt.nombre,
        id: opt.id,
        idCopago: opt.idCopago,
        prima: opt.prima,
        descripcion: opt.descripcion
      })) || [],
      seleccionesDinamicas: dynamicCoberturaSelections[planName] || {},
      opcionesDisponiblesEnAPI: {
        altoCosto: altoCostoOptionsQuery.data?.map(opt => ({ opt_id: opt.opt_id, descripcion: opt.descripcion, prima: opt.opt_prima })) || [],
        medicamentos: medicamentosOptionsQuery.data?.map(opt => ({ opt_id: opt.opt_id, descripcion: opt.descripcion, prima: opt.opt_prima })) || [],
        habitacion: habitacionOptionsQuery.data?.map(opt => ({ opt_id: opt.opt_id, descripcion: opt.descripcion, prima: opt.opt_prima })) || []
      }
    }, null, 2));
    
    setIsUpdating(true);
    
    setTimeout(() => {
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
            
            console.log(`💡 ALTO COSTO - Usando opt_id del catálogo: ${finalId} (Backend decidirá ID final)`);
            
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
            
            console.log(`💡 MEDICAMENTOS - Usando opt_id del catálogo: ${finalId} (Backend decidirá ID final)`);

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
            
            console.log(`💡 HABITACION - Usando opt_id del catálogo: ${finalId} (Backend decidirá ID final)`);
            
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
      const odontologiaSelected = odontologiaOptions.find(opt => opt.value === odontologiaValue);
      
      if (odontologiaSelected && odontologiaSelected.value !== "0") {
        // NUEVA LÓGICA SIMPLIFICADA: 
        // Para individuales: incluir si se selecciona explícitamente
        // Para colectivos: incluir SOLO si el filtro global está activado Y se selecciona valor
        const shouldIncludeOdontologia = 
          cliente?.clientChoosen === 1 || 
          (cliente?.clientChoosen === 2 && globalFilters.odontologia && odontologiaValue !== "0");
        
        // DEBUG: Log crítico para odontología solo en desarrollo
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`🦷🔍 DECISION ODONTOLOGIA - Plan: ${planName}`, {
        //     odontologiaValue,
        //     clientChoosen: cliente?.clientChoosen,
        //     globalFilterOdontologia: globalFilters.odontologia,
        //     shouldIncludeOdontologia,
        //     selectedOption: odontologiaSelected
        //   });
        // }
          
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
          
          // if (process.env.NODE_ENV === 'development') {
          //   console.log(`✅ ODONTOLOGIA INCLUIDA - Plan: ${planName}, Prima: ${primaCalculada}`);
          // }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(`❌ ODONTOLOGIA EXCLUIDA - Plan: ${planName}, Razón: Filtro global desactivado o cliente colectivo sin filtro`);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🦷⚠️ ODONTOLOGIA NO SELECCIONADA - Plan: ${planName}, Valor: ${odontologiaValue}`);
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
    }, 100);
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

  // Actualizar todos los planes cuando cambian los filtros globales (solo para clientChoosen === 2) - SIMPLIFICADO
  useEffect(() => {
    // 🚨 FIX CRÍTICO: En modo edición, solo ejecutar si los filtros han sido inicializados correctamente
    // Evita que se borren opcionales cuando se resetean temporalmente los filtros al navegar
    const shouldUpdate = cliente?.clientChoosen === 2 && 
                        !isUpdating && 
                        Object.keys(planesData).length > 0 &&
                        (!isEditMode || editModeInitializedRef.current);
    
    // 🚨 NUEVO FIX: En modo edición, NO actualizar si ya hay opcionales en el store
    // Solo actualizar si realmente se necesita (crear nuevas opcionales, no regenerar existentes)
    const hasExistingOpcionales = isEditMode && planes.some(plan => plan.opcionales.length > 0);
    
    if (shouldUpdate && !hasExistingOpcionales) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan] && planSelections[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
            updatePlanOpcionales(plan.plan, odontologiaValue);
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('⏸️ Skipping filtros update:', {
        clientChoosen: cliente?.clientChoosen,
        isUpdating,
        planesDataKeys: Object.keys(planesData).length,
        isEditMode,
        editModeInitialized: editModeInitializedRef.current,
        hasExistingOpcionales: hasExistingOpcionales
      });
    }
  }, [
    globalFilters.altoCosto, 
    globalFilters.medicamentos, 
    globalFilters.habitacion, 
    globalFilters.odontologia,
    cliente?.clientChoosen
  ]); // SIMPLIFICADO: Solo las dependencias críticas

  // Actualizar automáticamente para individuales (clientChoosen === 1) cuando se cargan los datos - SIMPLIFICADO
  useEffect(() => {
    if (cliente?.clientChoosen === 1 && !isUpdating && Object.keys(planesData).length > 0 && Object.keys(planSelections).length > 0) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan] && planSelections[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
            updatePlanOpcionales(plan.plan, odontologiaValue);
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [
    cliente?.clientChoosen,
    Object.keys(planesData).length,
    Object.keys(planSelections).length
  ]); // SIMPLIFICADO

  // ELIMINADO: useEffect problemático que causaba bucle infinito
  // Ya no es necesario un useEffect complejo para cargar datos por primera vez

  const handleGlobalFilterChange = (filter: string, checked: boolean) => {
    setUserHasModifiedFilters(true); // Marcar que el usuario ha modificado los filtros
    setGlobalFilters(prev => ({
      ...prev,
      [filter]: checked
    }));

    // Si se está desactivando una cobertura, limpiar las selecciones dinámicas y copagos
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
        
        // Limpiar copago relacionado específico al tipo de cobertura
        setDynamicCopagoSelections(prev => ({
          ...prev,
          [plan.plan]: {
            ...prev[plan.plan],
            [filter]: ''
          }
        }));

        // CRÍTICO: También limpiar la selección de odontología cuando se desmarca el filtro
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
      
      // Forzar actualización inmediata del store para sincronizar visual con datos
      setTimeout(() => {
        planes.forEach(plan => {
          const odontologiaValue = filter === 'odontologia' ? "0" : (planSelections[plan.plan]?.odontologia || "0");
          updatePlanOpcionales(plan.plan, odontologiaValue);
        });
      }, 50);
    }
  };

  const handleOdontologiaChange = (planName: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) {
      
      return;
    }
    
    
    
    // ⭐ MEJORA: Marcar como actualizando inmediatamente para prevenir clicks múltiples
    setIsUpdating(true);
    
    // 🆕 LÓGICA CORREGIDA FINAL: 
    // - COLECTIVOS (clientChoosen === 2): Cada plan selecciona independientemente (incluyendo odontología)
    // - INDIVIDUALES (clientChoosen === 1): Aplicar a todos los planes (comportamiento unificado)
    setPlanSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico (odontología también es independiente)
        newSelections[planName] = {
          ...newSelections[planName],
          odontologia: value
        };
        
        
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes (comportamiento unificado)
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            odontologia: value
          };
        });
        
       
      }
      
      return newSelections;
    });
    
    // Debounce para procesar la actualización del store
    const timeoutId = setTimeout(() => {
      
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        updatePlanOpcionales(planName, value);
      } else {
        // INDIVIDUAL: Actualizar TODOS los planes en el store
        planes.forEach(plan => {
          updatePlanOpcionales(plan.plan, value);
        });
      }
      
      // Liberar el flag después de procesar
      setTimeout(() => {
        setIsUpdating(false);
        
      }, 50);
    }, 150); // Reducido para mejor responsividad
    
    // Limpiar timeout previo si existe
    if (odontologiaTimeoutRef.current) {
      clearTimeout(odontologiaTimeoutRef.current);
    }
    odontologiaTimeoutRef.current = timeoutId;
  };

  const handleCoberturaChange = (planName: string, coberturaType: keyof CoberturaSelections, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    // 🆕 LÓGICA DIFERENCIADA: 
    // - Colectivos: Solo actualizar el plan específico
    // - Individuales: Aplicar a todos los planes
    setCoberturaSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        newSelections[planName] = {
          ...newSelections[planName],
          [coberturaType]: value
        };
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes existentes (comportamiento original)
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            [coberturaType]: value
          };
        });
      }
      
      return newSelections;
    });
    
    // Actualizar inmediatamente los planes correspondientes
    setTimeout(() => {
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        const odontologiaValue = planSelections[planName]?.odontologia || "0";
        updatePlanOpcionales(planName, odontologiaValue);
      } else {
        // INDIVIDUAL: Actualizar todos los planes
        planes.forEach(plan => {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        });
      }
    }, 100);
  };

  // Nuevos handlers para selecciones dinámicas
  const handleDynamicCoberturaChange = (planName: string, coberturaType: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    // 🆕 RESET CRÍTICO: Usuario está haciendo selección manual - ya no es navegación
    navigationLoadedRef.current = false;
    
    console.log(`🔧 SELECCIÓN DINÁMICA - Iniciando cambio:`, JSON.stringify({
      planName,
      coberturaType,
      value,
      clientChoosen: cliente?.clientChoosen,
      isUpdating,
      navigationLoadedResetTo: false
    }, null, 2));
    
    // 🆕 LÓGICA DIFERENCIADA: 
    // - Colectivos: Solo actualizar el plan específico
    // - Individuales: Aplicar a todos los planes
    setDynamicCoberturaSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        const currentPlanSelections = newSelections[planName] || {};
        newSelections[planName] = {
          ...currentPlanSelections,
          [coberturaType]: value
        };
        
        console.log(`✅ COLECTIVO - Selección actualizada para ${planName}:`, JSON.stringify({
          planName,
          coberturaType,
          value,
          seleccionesActualizadas: newSelections[planName]
        }, null, 2));
        
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes existentes (comportamiento original)
        const updatedPlans: string[] = [];
        planes.forEach(plan => {
          const currentPlanSelections = newSelections[plan.plan] || {};
          newSelections[plan.plan] = {
            ...currentPlanSelections,
            [coberturaType]: value
          };
          updatedPlans.push(plan.plan);
        });
        
        console.log(`✅ INDIVIDUAL - Selecciones aplicadas a todos los planes:`, JSON.stringify({
          coberturaType,
          value,
          planesActualizados: updatedPlans
        }, null, 2));
      }
      
      return newSelections;
    });
    
    // Si se selecciona "Ninguna" (valor "0"), también limpiar el copago asociado
    if (value === "0") {
      console.log(`🧹 LIMPIANDO COPAGO - Valor "0" seleccionado para ${coberturaType} en ${planName}`);
      
      setDynamicCopagoSelections(prev => {
        const newSelections = { ...prev };
        
        if (cliente?.clientChoosen === 2) {
          // COLECTIVO: Solo limpiar el plan específico
          newSelections[planName] = {
            ...newSelections[planName],
            [coberturaType]: "0"
          };
        } else {
          // INDIVIDUAL: Limpiar todos los planes
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
    
    // Usar un timeout más largo para evitar conflictos de estado
    setTimeout(() => {
      console.log(`⏰ TIMEOUT - Actualizando store para ${planName}, cobertura: ${coberturaType}, valor: ${value}`);
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        const odontologiaValue = planSelections[planName]?.odontologia || "0";
        console.log(`🎯 COLECTIVO - Actualizando solo plan ${planName} con odontología: ${odontologiaValue}`);
        updatePlanOpcionales(planName, odontologiaValue);
      } else {
        // INDIVIDUAL: Actualizar todos los planes
        console.log(`🎯 INDIVIDUAL - Actualizando todos los planes`);
        planes.forEach(plan => {
          const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
          updatePlanOpcionales(plan.plan, odontologiaValue);
        });
      }
    }, 200); // 🔧 Aumentar timeout para dar tiempo a React a actualizar el estado
  };

  const handleDynamicCopagoChange = (planName: string, coberturaType: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    console.log(`🔄 COPAGO CHANGE: ${planName} - ${coberturaType} = ${value}`);
    
    // � MAPEO DE VALORES: Encontrar la opción correspondiente usando el mismo algoritmo de mapeo
    const currentPlanData = planQueriesData.find(pq => pq.planName === planName);
    if (!currentPlanData?.data) {
      console.log(`❌ No se encontraron opcionales para el plan ${planName}`);
      return;
    }
    
    let mappedValue = value;
    
    // Buscar en las opciones correspondientes al tipo de cobertura
    const targetCoberturaType = coberturaType.replace('copago', '').toLowerCase().trim();
    let matchingOption: Copago | undefined = undefined;
    
    // Mapear el tipo de cobertura a las opciones disponibles
    switch (targetCoberturaType) {
      case 'altocosto':
        matchingOption = copagosAltoCostoQuery.data?.find((opt) => 
          opt.id.toString() === value
        );
        break;
      case 'medicamentos':
        matchingOption = copagosQuery.data?.find((opt) => 
          opt.id.toString() === value
        );
        break;
      case 'habitacion':
        matchingOption = copagosHabitacionQuery.data?.find((opt) => 
          opt.id.toString() === value
        );
        break;
    }
    
    // Si encontramos la opción exacta, usar su id
    if (matchingOption) {
      mappedValue = matchingOption.id.toString();
      console.log(`✅ MAPEO EXACTO para ${coberturaType}: ${value} → ${mappedValue}`);
    } else {
      console.log(`⚠️ No se encontró mapeo exacto para ${coberturaType} con valor ${value}, usando valor original`);
    }
    
    // �🆕 LÓGICA DIFERENCIADA: 
    // - Colectivos: Solo actualizar el plan específico
    // - Individuales: Aplicar a todos los planes
    setDynamicCopagoSelections(prev => {
      const newSelections = { ...prev };
      
      if (cliente?.clientChoosen === 2) {
        // COLECTIVO: Solo actualizar el plan específico
        newSelections[planName] = {
          ...newSelections[planName],
          [coberturaType]: value
        };
        
        console.log(`🎯 COLECTIVO - Solo ${planName} actualizado:`, newSelections[planName]);
        
      } else {
        // INDIVIDUAL: Aplicar el cambio a todos los planes existentes (comportamiento original)
        const updatedPlans: string[] = [];
        planes.forEach(plan => {
          newSelections[plan.plan] = {
            ...newSelections[plan.plan],
            [coberturaType]: value
          };
          updatedPlans.push(plan.plan);
        });
        
        console.log(`🎯 INDIVIDUAL - Todos los planes actualizados con ${coberturaType}=${value}:`, updatedPlans);
      }
      
      return newSelections;
    });
    
    // ✅ OPTIMIZACIÓN: Sincronización movida a validateAndSaveToStore()
    // Ya no necesitamos setTimeout aquí - los datos se sincronizan de manera
    // confiable cuando el usuario navega al presionar "Siguiente"
  };

  /**
   * 🎯 LÓGICA DIFERENCIADA PARA COBERTURAS OPCIONALES:
   * 
   * COLECTIVOS (clientChoosen === 2):
   * - TODAS LAS COBERTURAS (incluyendo odontología): Selecciones independientes por plan
   * - COPAGOS: Selecciones independientes por plan
   * - Al cambiar cualquier cobertura, SOLO afecta al plan específico
   * - Permite configuraciones granulares por plan en todo
   * - Cada plan puede tener diferentes niveles de odontología, medicamentos, etc.
   * 
   * INDIVIDUALES (clientChoosen === 1):
   * - TODAS las selecciones se aplican a TODOS los planes (comportamiento unificado)
   * - Al cambiar cualquier opción, se sincroniza en todos los planes
   * - Mantiene consistencia familiar total
   * 
   * NAVEGACIÓN ENTRE STEPS:
   * - Las selecciones específicas por plan se preservan al navegar
   * - CADA PLAN mantiene sus selecciones individuales en colectivos
   * - Los copagos y coberturas específicas se restauran individualmente por plan
   */

  // Estados para filtros globales y selecciones de planes
  const isLoading = planQueriesData.some(q => q.isLoading);
  const hasError = planQueriesData.some(q => q.error);
  const isEmpty = !cliente || planes.length === 0;

  // 🔍 DEBUG: Log final del hook antes de retornar
  // if (process.env.NODE_ENV === 'development' && Object.keys(dynamicCoberturaSelections).length > 0) {
  //   console.log('🔍 HOOK RETURN - Valores finales de dynamicCoberturaSelections:', {
  //     timestamp: new Date().toISOString(),
  //     valores: Object.entries(dynamicCoberturaSelections).map(([plan, sel]) => ({
  //       plan,
  //       habitacion: sel?.habitacion || 'undefined',
  //       altoCosto: sel?.altoCosto || 'undefined',
  //       medicamentos: sel?.medicamentos || 'undefined'
  //     }))
  //   });
  // }

  // 🔍 DEBUG: Log final para verificar valores devueltos
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔍 HOOK RETURN - Valores finales de dynamicCoberturaSelections:', {
  //     timestamp: new Date().toISOString(),
  //     dynamicCoberturaSelections: Object.entries(dynamicCoberturaSelections).map(([plan, sel]) => ({
  //       plan,
  //       habitacion: sel.habitacion,
  //       altoCosto: sel.altoCosto,
  //       medicamentos: sel.medicamentos,
  //       odontologia: sel.odontologia
  //     }))
  //   });
  // }

  // 🔍 DEBUG CRÍTICO: Verificar valores que se retornan a la UI
 

  // 🆕 FUNCIÓN PARA VALIDAR Y GUARDAR AL NAVEGAR
  const validateAndSaveToStore = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 NAVEGACIÓN: Validando y guardando coberturas antes de avanzar al siguiente step');
      
      // Forzar actualización de todos los planes en el store
      planes.forEach(plan => {
        const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
        updatePlanOpcionales(plan.plan, odontologiaValue);
      });
      
      // Dar un pequeño tiempo para que React complete cualquier actualización pendiente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ NAVEGACIÓN: Coberturas guardadas exitosamente');
      return true;
    } catch (error) {
      console.error('❌ NAVEGACIÓN: Error al guardar coberturas:', error);
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
    odontologiaOptions,
    
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
    
    // 🆕 FUNCIÓN PARA NAVEGACIÓN
    validateAndSaveToStore
  };

  
};

// 🆕 MAPEO INTELIGENTE POST-NAVEGACIÓN: Convertir IDs del store a opciones de API

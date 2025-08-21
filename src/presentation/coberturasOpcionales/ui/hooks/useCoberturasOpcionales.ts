import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUnifiedQuotationStore } from '@/core';
import { usePlanesOpcionales, useCoberturasOpcionalesByType, useCopagos } from '../../hooks/usePlanesOpcionales';
import { CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
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
  
  // Resetear refs SOLO cuando cambia el modo (create <-> edit)
  useEffect(() => {
    // Solo resetear si realmente cambió el modo, no en el primer render
    if (previousModeRef.current !== mode && previousModeRef.current !== undefined) {
      initializedRef.current = false;
      editModeInitializedRef.current = false;
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
    
    setCopagoHabitacionSelections(prev => ({
      ...prev,
      [planName]: value
    }));
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 100);
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const handleCopagoChange = (planName: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    setCopagoSelections(prev => ({
      ...prev,
      [planName]: value
    }));
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 100);
  };

  // Crear hooks individuales para cada plan - siempre llamar los hooks con condición de enabled
  const plan1Query = usePlanesOpcionales(
    planes[0]?.plan || '', 
    cliente?.tipoPlan || 1, 
    cliente?.clientChoosen || 1, 
    !!planes[0]?.plan // enabled solo si hay nombre de plan
  );
  const plan2Query = usePlanesOpcionales(
    planes[1]?.plan || '', 
    cliente?.tipoPlan || 1, 
    cliente?.clientChoosen || 1, 
    !!planes[1]?.plan
  );
  const plan3Query = usePlanesOpcionales(
    planes[2]?.plan || '', 
    cliente?.tipoPlan || 1, 
    cliente?.clientChoosen || 1, 
    !!planes[2]?.plan
  );
  const plan4Query = usePlanesOpcionales(
    planes[3]?.plan || '', 
    cliente?.tipoPlan || 1, 
    cliente?.clientChoosen || 1, 
    !!planes[3]?.plan
  );
  const plan5Query = usePlanesOpcionales(
    planes[4]?.plan || '', 
    cliente?.tipoPlan || 1, 
    cliente?.clientChoosen || 1, 
    !!planes[4]?.plan
  );

  // Hooks para opciones dinámicas por tipo de cobertura (solo para colectivos)
  const isColectivo = cliente?.clientChoosen === 2;
  
  // Alto Costo
  const altoCostoOptionsQuery = useCoberturasOpcionalesByType(
    'altoCosto', 
    cliente?.tipoPlan || 1, 
    isColectivo // 🚨 CAMBIO CRÍTICO: En modo edición siempre habilitado para colectivos
  );
  
  // 🔍 DEBUG CRÍTICO: Log del estado de las queries
  // console.log('🔍 QUERIES STATUS DETALLADO:', {
  //   altoCosto: {
  //     enabled: isColectivo,
  //     isColectivo,
  //     globalFilterAltoCosto: globalFilters.altoCosto,
  //     isEditMode,
  //     tipoPlan: cliente?.tipoPlan,
  //     isLoading: altoCostoOptionsQuery.isLoading,
  //     isError: altoCostoOptionsQuery.isError,
  //     dataLength: altoCostoOptionsQuery.data?.length || 0,
  //     error: altoCostoOptionsQuery.error
  //   }
  // });
  
  // Medicamentos
  const medicamentosOptionsQuery = useCoberturasOpcionalesByType(
    'medicamentos', 
    cliente?.tipoPlan || 1, 
    isColectivo // 🚨 CAMBIO CRÍTICO: En modo edición siempre habilitado para colectivos
  );
  
  // Habitación
  const habitacionOptionsQuery = useCoberturasOpcionalesByType(
    'habitacion', 
    cliente?.tipoPlan || 1, 
    isColectivo // 🚨 CAMBIO CRÍTICO: En modo edición siempre habilitado para colectivos
  );
  
  // Odontología
  const odontologiaOptionsQuery = useCoberturasOpcionalesByType(
    'odontologia', 
    cliente?.tipoPlan || 1, 
    isColectivo // 🚨 CAMBIO CRÍTICO: En modo edición siempre habilitado para colectivos
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
  
  // 🔍 DEBUG COPAGOS STATUS
  // console.log('🔍 COPAGOS STATUS:', {
  //   medicamentos: {
  //     isLoading: copagosQuery.isLoading,
  //     dataLength: copagosQuery.data?.length || 0,
  //     error: copagosQuery.error
  //   },
  //   altoCosto: {
  //     isLoading: copagosAltoCostoQuery.isLoading,
  //     dataLength: copagosAltoCostoQuery.data?.length || 0,
  //     error: copagosAltoCostoQuery.error
  //   },
  //   habitacion: {
  //     isLoading: copagosHabitacionQuery.isLoading,
  //     dataLength: copagosHabitacionQuery.data?.length || 0,
  //     error: copagosHabitacionQuery.error
  //   }
  // });

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

  // Inicializar selecciones de odontología para cada plan - CON CONTROL DE REFS
  useEffect(() => {
    // Evitar re-inicializaciones innecesarias
    if (planes.length === 0 || initializedRef.current) return;
    
    
    const initialSelections: {[planName: string]: {[key: string]: string}} = {};
    let needsUpdate = false;
    
    planes.forEach(plan => {
      if (!planSelections[plan.plan]) {
        const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
        let odontologiaValue = "0";
        
        if (isEditMode && odontologiaOpcional) {
          // console.log(`🦷 ODONTOLOGÍA - Procesando para ${plan.plan}:`, {
          //   prima: odontologiaOpcional.prima,
          //   cantidadAfiliados: plan.cantidadAfiliados || 1
          // });
          
          // 🚨 FIX: Mapear por prima dividida entre cantidad de afiliados
          const cantidadAfiliados = plan.cantidadAfiliados || 1;
          const primaUnitaria = odontologiaOpcional.prima / cantidadAfiliados;
          
          console.log(`🦷 ODONTOLOGÍA - Prima unitaria: ${primaUnitaria}, Opciones estáticas:`, 
            odontologiaOptions.map(opt => ({ value: opt.value, label: opt.label, prima: opt.prima }))
          );
          
          // Buscar la opción de odontología que coincida con la prima unitaria
          const staticOdontologiaMatch = odontologiaOptions.find(opt => Math.abs(opt.prima - primaUnitaria) < 1);
          
          if (staticOdontologiaMatch) {
            odontologiaValue = staticOdontologiaMatch.value;
            // console.log(`🦷 ODONTOLOGÍA MAPEADO EXITOSAMENTE: Prima ${primaUnitaria} -> value: ${staticOdontologiaMatch.value} (${staticOdontologiaMatch.label})`);
          } else {
            // console.log(`🦷 ODONTOLOGÍA - No se encontró coincidencia exacta para prima ${primaUnitaria}`);
            // Fallback: usar el valor más alto si no encuentra exacto
            odontologiaValue = "3";
            // console.log(`🦷 ODONTOLOGÍA FALLBACK: Usando Nivel III (value: 3)`);
          }
        } else if (isEditMode) {
          console.log(`🦷 Plan ${plan.plan}: No hay odontología en el store`);
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
  }, [planes.length]); // Solo depender de la cantidad de planes

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
    
    // console.log('🎯 INICIALIZANDO FILTROS GLOBALES:', {
    //   clientChoosen: cliente?.clientChoosen,
    //   isEditMode,
    //   planesLength: planes.length,
    //   userHasModified: userHasModifiedFilters
    // });
    
    if (cliente?.clientChoosen === 2) {
      // Para colectivos, leer las opcionales existentes para determinar qué filtros deben estar activos
      const firstPlan = planes[0];
      if (firstPlan && firstPlan.opcionales.length > 0) {
        const hasAltoCosto = firstPlan.opcionales.some(opt => opt.nombre === "ALTO COSTO");
        const hasMedicamentos = firstPlan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS");
        const hasHabitacion = firstPlan.opcionales.some(opt => opt.nombre === "HABITACION");
        const hasOdontologia = firstPlan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA");

        // console.log('🔍 FILTROS DETECTADOS EN STORE:', {
        //   hasAltoCosto,
        //   hasMedicamentos,
        //   hasHabitacion,
        //   hasOdontologia
        // });

        setGlobalFilters({
          altoCosto: hasAltoCosto,
          medicamentos: hasMedicamentos,
          habitacion: hasHabitacion,
          odontologia: hasOdontologia
        });
        
        console.log('✅ FILTROS GLOBALES ACTUALIZADOS DESDE STORE');
      } else {
        // 🚨 FIX CRÍTICO: En modo edición, FORZAR filtros activos para que los queries se ejecuten
        if (isEditMode) {
          console.log('🔧 MODO EDICIÓN: Forzando filtros activos para cargar opciones');
          setGlobalFilters({
            altoCosto: true,
            medicamentos: true,
            habitacion: true,
            odontologia: true
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
    if (!allOptionsLoaded || editModeInitializedRef.current) {
      // console.log('⏳ ESPERANDO DATOS:', {
      //   allOptionsLoaded,
      //   editModeInitialized: editModeInitializedRef.current,
      //   altoCostoLoading: altoCostoOptionsQuery.isLoading,
      //   medicamentosLoading: medicamentosOptionsQuery.isLoading,
      //   habitacionLoading: habitacionOptionsQuery.isLoading,
      //   copagosLoading: copagosQuery.isLoading
      // });
      return;
    }
    
    console.log('🚀 INICIANDO MAPEO INTELIGENTE - Todas las opciones cargadas');
    
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
        
        // 🚨 MAPEO INTELIGENTE MEJORADO: Mapear por prima con logs detallados
        opcionales.forEach(opcional => {
          // console.log(`🔍 Procesando opcional: ${opcional.nombre}, ID: ${opcional.id}, Prima: ${opcional.prima}`);
          
          if (opcional.nombre === "ALTO COSTO" && opcional.id) {
            // Mapear alto costo por prima
            if (altoCostoOptionsQuery.data && altoCostoOptionsQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitaria = opcional.prima / cantidadAfiliados;
              
              console.log(`💰 ALTO COSTO - Prima unitaria calculada: ${primaUnitaria}, Opciones disponibles:`, 
                altoCostoOptionsQuery.data.map(opt => ({ opt_id: opt.opt_id, opt_prima: opt.opt_prima, descripcion: opt.descripcion }))
              );
              
              // Buscar la opción que más se acerque a la prima unitaria (tolerancia ampliada)
              const matchingOption = altoCostoOptionsQuery.data.find(opt => 
                Math.abs(parseFloat(opt.opt_prima) - primaUnitaria) < 50 // Tolerancia ampliada a ±50
              );
              
              if (matchingOption) {
                selections.altoCosto = matchingOption.opt_id.toString();
                console.log(`💰 ALTO COSTO MAPEADO EXITOSAMENTE: Prima ${primaUnitaria} -> opt_id: ${matchingOption.opt_id} (${matchingOption.descripcion})`);
              } else {
                // Fallback: usar primera opción disponible
                selections.altoCosto = altoCostoOptionsQuery.data[0].opt_id.toString();
                console.log(`💰 ALTO COSTO FALLBACK: Usando primera opción disponible opt_id: ${altoCostoOptionsQuery.data[0].opt_id}`);
              }
            } else {
              console.log(`💰 ALTO COSTO - No hay opciones de API disponibles, usando ID del store: ${opcional.id}`);
              selections.altoCosto = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO ALTO COSTO" && opcional.id) {
            // Mapear copago de alto costo por prima
            if (copagosAltoCostoQuery.data && copagosAltoCostoQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitariaCopago = opcional.prima / cantidadAfiliados;
              
              // console.log(`💰 COPAGO ALTO COSTO - Prima unitaria: ${primaUnitariaCopago}, Opciones:`, 
              //   copagosAltoCostoQuery.data.map(c => ({ id: c.id, price: c.price, descripcion: c.descripcion }))
              // );
              
              // Buscar el copago que coincida con la prima (tolerancia ampliada)
              const matchingCopago = copagosAltoCostoQuery.data.find(copago => 
                Math.abs(copago.price - primaUnitariaCopago) < 10 // Tolerancia ampliada a ±10
              );
              
              if (matchingCopago) {
                if (!newDynamicCopagoSelections[plan.plan]) {
                  newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
                }
                newDynamicCopagoSelections[plan.plan].altoCosto = matchingCopago.id.toString();
                console.log(`💰 COPAGO ALTO COSTO MAPEADO: Prima ${primaUnitariaCopago} -> ID: ${matchingCopago.id} (${matchingCopago.descripcion})`);
              } else {
                console.log(`💰 COPAGO ALTO COSTO - No se encontró coincidencia por prima`);
              }
            }
          } else if (opcional.nombre === "MEDICAMENTOS" && opcional.id) {
            // Mapear medicamentos por prima
            if (medicamentosOptionsQuery.data && medicamentosOptionsQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitaria = opcional.prima / cantidadAfiliados;
              
              // console.log(`💊 MEDICAMENTOS - Prima unitaria calculada: ${primaUnitaria}, Opciones disponibles:`, 
              //   medicamentosOptionsQuery.data.map(opt => ({ opt_id: opt.opt_id, opt_prima: opt.opt_prima, descripcion: opt.descripcion }))
              // );
              
              // Buscar la opción que más se acerque a la prima unitaria (tolerancia ampliada)
              const matchingOption = medicamentosOptionsQuery.data.find(opt => 
                Math.abs(parseFloat(opt.opt_prima) - primaUnitaria) < 100 // Tolerancia ampliada a ±100
              );
              
              if (matchingOption) {
                selections.medicamentos = matchingOption.opt_id.toString();
                console.log(`💊 MEDICAMENTOS MAPEADO EXITOSAMENTE: Prima ${primaUnitaria} -> opt_id: ${matchingOption.opt_id} (${matchingOption.descripcion})`);
              } else {
                // Fallback: usar primera opción disponible
                selections.medicamentos = medicamentosOptionsQuery.data[0].opt_id.toString();
                console.log(`💊 MEDICAMENTOS FALLBACK: Usando primera opción disponible opt_id: ${medicamentosOptionsQuery.data[0].opt_id}`);
              }
            } else {
              console.log(`💊 MEDICAMENTOS - No hay opciones de API disponibles, usando ID del store: ${opcional.id}`);
              selections.medicamentos = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO MEDICAMENTOS" && opcional.id) {
            // Mapear copago de medicamentos por prima
            if (copagosQuery.data && copagosQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitariaCopago = opcional.prima / cantidadAfiliados;
              
              console.log(`💊 COPAGO MEDICAMENTOS - Prima unitaria: ${primaUnitariaCopago}, Opciones:`, 
                copagosQuery.data.map(c => ({ id: c.id, price: c.price, descripcion: c.descripcion }))
              );
              
              // Buscar el copago que coincida con la prima (tolerancia ampliada)
              const matchingCopago = copagosQuery.data.find(copago => 
                Math.abs(copago.price - primaUnitariaCopago) < 10 // Tolerancia ampliada a ±10
              );
              
              if (matchingCopago) {
                if (!newDynamicCopagoSelections[plan.plan]) {
                  newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
                }
                newDynamicCopagoSelections[plan.plan].medicamentos = matchingCopago.id.toString();
                console.log(`💊 COPAGO MEDICAMENTOS MAPEADO: Prima ${primaUnitariaCopago} -> ID: ${matchingCopago.id} (${matchingCopago.descripcion})`);
              } else {
                console.log(`💊 COPAGO MEDICAMENTOS - No se encontró coincidencia por prima`);
              }
            }
          } else if (opcional.nombre === "HABITACION" && opcional.id) {
            // Mapear habitación por prima
            if (habitacionOptionsQuery.data && habitacionOptionsQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitaria = opcional.prima / cantidadAfiliados;
              
              console.log(`🏠 HABITACIÓN - Prima unitaria calculada: ${primaUnitaria}, Opciones disponibles:`, 
                habitacionOptionsQuery.data.map(opt => ({ opt_id: opt.opt_id, opt_prima: opt.opt_prima, descripcion: opt.descripcion }))
              );
              
              // Buscar la opción que más se acerque a la prima unitaria (tolerancia ampliada)
              const matchingOption = habitacionOptionsQuery.data.find(opt => 
                Math.abs(parseFloat(opt.opt_prima) - primaUnitaria) < 100 // Tolerancia ampliada a ±100
              );
              
              if (matchingOption) {
                selections.habitacion = matchingOption.opt_id.toString();
                console.log(`🏠 HABITACIÓN MAPEADO EXITOSAMENTE: Prima ${primaUnitaria} -> opt_id: ${matchingOption.opt_id} (${matchingOption.descripcion})`);
              } else {
                // Fallback: usar primera opción disponible
                selections.habitacion = habitacionOptionsQuery.data[0].opt_id.toString();
                console.log(`🏠 HABITACIÓN FALLBACK: Usando primera opción disponible opt_id: ${habitacionOptionsQuery.data[0].opt_id}`);
              }
            } else {
              console.log(`🏠 HABITACIÓN - No hay opciones de API disponibles, usando ID del store: ${opcional.id}`);
              selections.habitacion = opcional.id.toString();
            }
          } else if (opcional.nombre === "COPAGO HABITACIÓN" && opcional.id) {
            // Mapear copago de habitación por prima
            if (copagosHabitacionQuery.data && copagosHabitacionQuery.data.length > 0) {
              const cantidadAfiliados = plan.cantidadAfiliados || 1;
              const primaUnitariaCopago = opcional.prima / cantidadAfiliados;
              
              // console.log(`🏠 COPAGO HABITACIÓN - Prima unitaria: ${primaUnitariaCopago}, Opciones:`, 
              //   copagosHabitacionQuery.data.map(c => ({ id: c.id, price: c.price, descripcion: c.descripcion }))
              // );
              
              // Buscar el copago que coincida con la prima (tolerancia aumentada para habitación)
              const matchingCopago = copagosHabitacionQuery.data.find(copago => 
                Math.abs(copago.price - primaUnitariaCopago) < 50 // Tolerancia aumentada a ±50 para habitación
              );
              
              if (matchingCopago) {
                if (!newDynamicCopagoSelections[plan.plan]) {
                  newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
                }
                newDynamicCopagoSelections[plan.plan].habitacion = matchingCopago.id.toString();
                // console.log(`🏠 COPAGO HABITACIÓN MAPEADO: Prima ${primaUnitariaCopago} -> ID: ${matchingCopago.id} (${matchingCopago.descripcion})`);
              } else {
                // Fallback: si no encuentra match por prima, usar el primer copago disponible
                const fallbackCopago = copagosHabitacionQuery.data[0];
                if (fallbackCopago) {
                  if (!newDynamicCopagoSelections[plan.plan]) {
                    newDynamicCopagoSelections[plan.plan] = { altoCosto: '', medicamentos: '', habitacion: '' };
                  }
                  newDynamicCopagoSelections[plan.plan].habitacion = fallbackCopago.id.toString();
                  console.log(`🏠 COPAGO HABITACIÓN FALLBACK: Prima ${primaUnitariaCopago} -> ID: ${fallbackCopago.id} (${fallbackCopago.descripcion})`);
                } else {
                  console.log(`🏠 COPAGO HABITACIÓN - No se encontró coincidencia por prima ni fallback disponible`);
                }
              }
            }
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
      // Para individuales: usar plan.afiliados.length (solo para mostrar, no para cálculos)
      const cantidadAfiliados = cliente?.clientChoosen === 2 
        ? (plan.cantidadAfiliados || 1)
        : plan.afiliados.length;

      // Multiplicador para cálculos: 1 para individuales, cantidadAfiliados para colectivos
      const multiplicadorPrima = cliente?.clientChoosen === 2 
        ? cantidadAfiliados 
        : 1;

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
            
            // Agregar la cobertura base
            opcionales.push({
              id: selectedOption.opt_id,
              idCopago: currentDynamicCopagos.altoCosto ? parseInt(currentDynamicCopagos.altoCosto) : undefined,
              nombre: "ALTO COSTO",
              descripcion: selectedOption.descripcion,
              prima: primaBase // Prima base de la cobertura
            });
            subTotalOpcional += primaBase;
            
            // Si hay copago seleccionado, agregarlo como costo adicional
            if (currentDynamicCopagos.altoCosto && currentDynamicCopagos.altoCosto !== "0") {
              const copagoOpt = copagosAltoCostoQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.altoCosto);
              if (copagoOpt) {
                const primaCopago = copagoOpt.price * multiplicadorPrima;
                opcionales.push({
                  id: 2, // ID para Alto Costo (copago)
                  idCopago: parseInt(currentDynamicCopagos.altoCosto),
                  nombre: "COPAGO ALTO COSTO",
                  descripcion: copagoOpt.descripcion,
                  prima: primaCopago // El copago se suma al total
                });
                subTotalOpcional += primaCopago;
              }
            }
          }
        } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.altoCosto) {
          // Ya no hay fallback estático - solo datos dinámicos
        } else {
          // Para individuales, usar el valor estático original SIN multiplicar
          const prima = parseFloat(data.primaCosto) || 0;
          const primaCalculada = prima * multiplicadorPrima;
          opcionales.push({
            id: 2, // ID para Alto Costo
            nombre: "ALTO COSTO",
            descripcion: data.altoCosto,
            prima: primaCalculada
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

            // Agregar la cobertura base
            opcionales.push({
              id: selectedOption.opt_id,
              idCopago: currentDynamicCopagos.medicamentos ? parseInt(currentDynamicCopagos.medicamentos) : undefined,
              nombre: "MEDICAMENTOS",
              descripcion: selectedOption.descripcion,
              prima: primaBase // Prima base de la cobertura
            });
            subTotalOpcional += primaBase;

            // Si hay copago seleccionado, agregarlo como costo adicional
            if (currentDynamicCopagos.medicamentos && currentDynamicCopagos.medicamentos !== "0") {
              const copagoOpt = copagosQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.medicamentos);
              if (copagoOpt) {
                const primaCopago = copagoOpt.price * multiplicadorPrima;
                opcionales.push({
                  id: 1, // ID para Medicamentos (copago)
                  idCopago: parseInt(currentDynamicCopagos.medicamentos),
                  nombre: "COPAGO MEDICAMENTOS",
                  descripcion: copagoOpt.descripcion,
                  prima: primaCopago // El copago se suma al total
                });
                subTotalOpcional += primaCopago;
              }
            }

          }
        } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.medicamentos) {
          // Ya no hay fallback estático - solo datos dinámicos
        } else {
          // Para individuales, usar el valor estático original SIN multiplicar por cantidad de afiliados
          const prima = parseFloat(data.medicamentoCosto) || 0;
          const primaCalculada = prima * multiplicadorPrima;
          opcionales.push({
            id: 1, // ID para Medicamentos
            nombre: "MEDICAMENTOS",
            descripcion: data.medicamento,
            prima: primaCalculada
          });
          subTotalOpcional += primaCalculada;
        }
      }

      if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.habitacion)) {
        if (cliente?.clientChoosen === 2 && currentDynamicSelections.habitacion && currentDynamicSelections.habitacion !== "0") {
          // Para colectivos, usar la selección específica del dropdown dinámico
          const selectedOption = habitacionOptionsQuery.data?.find(opt => opt.opt_id.toString() === currentDynamicSelections.habitacion);
          if (selectedOption) {
            const primaBase = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
            
            // Agregar la cobertura base
            opcionales.push({
              id: selectedOption.opt_id,
              idCopago: currentDynamicCopagos.habitacion ? parseInt(currentDynamicCopagos.habitacion) : undefined,
              nombre: "HABITACION",
              descripcion: selectedOption.descripcion,
              prima: primaBase // Prima base de la cobertura
            });
            subTotalOpcional += primaBase;
            
            // Si hay copago seleccionado, agregarlo como costo adicional
            if (currentDynamicCopagos.habitacion && currentDynamicCopagos.habitacion !== "0") {
              const copagoOpt = copagosHabitacionQuery.data?.find(opt => opt.id.toString() === currentDynamicCopagos.habitacion);
              if (copagoOpt) {
                const primaCopago = copagoOpt.price * multiplicadorPrima;
                opcionales.push({
                  id: 3, // ID para Habitación (copago)
                  idCopago: parseInt(currentDynamicCopagos.habitacion),
                  nombre: "COPAGO HABITACIÓN",
                  descripcion: copagoOpt.descripcion,
                  prima: primaCopago // El copago se suma al total
                });
                subTotalOpcional += primaCopago;
              }
            }

           
          }
        } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.habitacion) {
          // Ya no hay fallback estático - solo datos dinámicos
        } else {
          // Para individuales, usar el valor estático original SIN multiplicar por cantidad de afiliados
          const prima = parseFloat(data.habitacionCosto) || 0;
          const primaCalculada = prima * multiplicadorPrima;
          opcionales.push({
            id: 3, // ID para Habitación
            nombre: "HABITACION",
            descripcion: data.habitacion,
            prima: primaCalculada
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
        if (process.env.NODE_ENV === 'development') {
          console.log(`🦷🔍 DECISION ODONTOLOGIA - Plan: ${planName}`, {
            odontologiaValue,
            clientChoosen: cliente?.clientChoosen,
            globalFilterOdontologia: globalFilters.odontologia,
            shouldIncludeOdontologia,
            selectedOption: odontologiaSelected
          });
        }
          
        if (shouldIncludeOdontologia) {
          const primaCalculada = odontologiaSelected.prima * multiplicadorPrima;

          opcionales.push({
            id: 4, // ID para Odontología
            nombre: "ODONTOLOGIA",
            descripcion: odontologiaSelected.label,
            prima: primaCalculada
          });
          subTotalOpcional += primaCalculada;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ODONTOLOGIA INCLUIDA - Plan: ${planName}, Prima: ${primaCalculada}`);
          }
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
    
    // Actualizar inmediatamente el estado local para feedback visual instantáneo
    setPlanSelections(prev => {
      const newSelections = {
        ...prev,
        [planName]: {
          ...prev[planName],
          odontologia: value
        }
      };
      return newSelections;
    });
    
    // Debounce para procesar la actualización del store
    const timeoutId = setTimeout(() => {
      updatePlanOpcionales(planName, value);
      
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
    
    setCoberturaSelections(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [coberturaType]: value
      }
    }));
    
    // Actualizar inmediatamente
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 100);
  };

  // Nuevos handlers para selecciones dinámicas
  const handleDynamicCoberturaChange = (planName: string, coberturaType: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    // Actualizar estado local primero
    setDynamicCoberturaSelections(prev => {
      const currentPlanSelections = prev[planName] || {};
      return {
        ...prev,
        [planName]: {
          ...currentPlanSelections,
          [coberturaType]: value
        }
      };
    });
    
    // Si se selecciona "Ninguna" (valor "0"), también limpiar el copago asociado
    if (value === "0") {
      setDynamicCopagoSelections(prev => ({
        ...prev,
        [planName]: {
          ...prev[planName],
          [coberturaType]: "0"
        }
      }));
    }
    
    // Usar un timeout más largo para evitar conflictos de estado
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 100);
  };

  const handleDynamicCopagoChange = (planName: string, coberturaType: string, value: string) => {
    // Prevenir actualizaciones múltiples simultáneas
    if (isUpdating) return;
    
    setDynamicCopagoSelections(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [coberturaType]: value
      }
    }));
    
    // Actualizar inmediatamente
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 100);
  };

  // Estados derivados
  const isLoading = planQueriesData.some(q => q.isLoading);
  const hasError = planQueriesData.some(q => q.error);
  const isEmpty = !cliente || planes.length === 0;

  // 🔍 DEBUG: Log final del hook antes de retornar
  if (process.env.NODE_ENV === 'development' && Object.keys(dynamicCoberturaSelections).length > 0) {
    console.log('🔍 HOOK RETURN - Valores finales de dynamicCoberturaSelections:', {
      timestamp: new Date().toISOString(),
      valores: Object.entries(dynamicCoberturaSelections).map(([plan, sel]) => ({
        plan,
        habitacion: sel?.habitacion || 'undefined',
        altoCosto: sel?.altoCosto || 'undefined',
        medicamentos: sel?.medicamentos || 'undefined'
      }))
    });
  }

  // 🔍 DEBUG: Log final para verificar valores devueltos
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 HOOK RETURN - Valores finales de dynamicCoberturaSelections:', {
      timestamp: new Date().toISOString(),
      dynamicCoberturaSelections: Object.entries(dynamicCoberturaSelections).map(([plan, sel]) => ({
        plan,
        habitacion: sel.habitacion,
        altoCosto: sel.altoCosto,
        medicamentos: sel.medicamentos,
        odontologia: sel.odontologia
      }))
    });
  }

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
    handleDynamicCopagoChange
  };

  
};
  
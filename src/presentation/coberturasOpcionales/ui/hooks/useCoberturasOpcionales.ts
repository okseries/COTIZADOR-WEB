import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import { usePlanesOpcionales } from '../../hooks/usePlanesOpcionales';
import { CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { OdontologiaOption } from '../components/OdontologiaSelect';

import { 
  CoberturaSelections, 
  defaultCoberturaSelections,
  altoCostoOptions,
  medicamentosOptions,
  habitacionOptions
} from '../../data/coberturaOptions';
import { copagoMedicamentosOptions, copagoHabitacionOptions } from '../../data/copagoOptions';

// Datos estáticos para odontología
const odontologiaOptions: OdontologiaOption[] = [
  { value: "0", label: "Seleccionar", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

export const useCoberturasOpcionales = () => {
  const { getFinalObject, updatePlanByName } = useQuotationStore();
  
  // Obtener el objeto una sola vez al inicio del render para evitar bucles
  const finalObject = getFinalObject();
  const { cliente, planes } = finalObject;
  
  
  // Estados locales
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
  const handleCopagoHabitacionChange = (planName: string, value: string) => {
    setCopagoHabitacionSelections(prev => ({
      ...prev,
      [planName]: value
    }));
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 50);
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const handleCopagoChange = (planName: string, value: string) => {
    setCopagoSelections(prev => ({
      ...prev,
      [planName]: value
    }));
    setTimeout(() => {
      const odontologiaValue = planSelections[planName]?.odontologia || "0";
      updatePlanOpcionales(planName, odontologiaValue);
    }, 50);
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
    console.log("📊 useEffect cargar datos ejecutándose:", {
      planQueriesDataLength: planQueriesData.length,
      planQueriesData: planQueriesData.map(q => ({ planName: q.planName, hasData: !!q.data, dataLength: q.data?.length || 0 }))
    });
    
    const newPlanesData: {[planName: string]: CoberturasOpcional[]} = {};
    let hasChanges = false;
    
    planQueriesData.forEach(({ planName, data }) => {
      if (data && planName) {
        newPlanesData[planName] = data;
        hasChanges = true;
        console.log(`✅ Datos cargados para plan: ${planName}:`, {
          totalItems: data.length,
          structure: data.map(item => ({
            id: item.id,
            nombrePlan: item.nombrePlan,
            altoCosto: item.altoCosto,
            medicamento: item.medicamento,
            habitacion: item.habitacion,
            primaCosto: item.primaCosto,
            medicamentoCosto: item.medicamentoCosto,
            habitacionCosto: item.habitacionCosto
          }))
        });
      }
    });
    
    if (hasChanges && Object.keys(newPlanesData).length > 0) {
      console.log("🗂️ Actualizando planesData:", Object.keys(newPlanesData));
      setPlanesData(newPlanesData);
    }
  }, [
    planQueriesData.map(q => `${q.planName}:${q.data?.length || 0}`).join(',')
  ]); // Depender solo de una representación string estable de los datos

  // Inicializar selecciones de odontología para cada plan
  useEffect(() => {
    const initialSelections: {[planName: string]: {[key: string]: string}} = {};
    let needsUpdate = false;
    
    planes.forEach(plan => {
      // Solo agregar si el plan no existe en las selecciones actuales
      const currentPlanSelections = planSelections[plan.plan];
      if (!currentPlanSelections) {
        const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
        let odontologiaValue = "0";
        
        if (odontologiaOpcional) {
          // Buscar por descripción en las opciones de odontología
          const found = odontologiaOptions.find(opt => opt.label === odontologiaOpcional.descripcion);
          if (found) {
            odontologiaValue = found.value;
            console.log(`🦷 Odontología detectada en plan ${plan.plan}:`, {
              descripcion: odontologiaOpcional.descripcion,
              value: odontologiaValue,
              prima: found.prima
            });
          } else {
            console.log(`⚠️ Descripción de odontología no encontrada:`, {
              plan: plan.plan,
              descripcion: odontologiaOpcional.descripcion,
              opcionesDisponibles: odontologiaOptions.map(opt => opt.label)
            });
          }
        }
        
        initialSelections[plan.plan] = {
          odontologia: odontologiaValue
        };
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      console.log("🔄 Actualizando planSelections con datos del store:", initialSelections);
      setPlanSelections(prev => ({ ...prev, ...initialSelections }));
    }
  }, [planes.length, planes.map(p => p.opcionales.length).join(',')]);

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
        console.log("🔄 Inicializando coberturaSelections:", initialCoberturaSelections);
        setCoberturaSelections(prev => ({ ...prev, ...initialCoberturaSelections }));
      }
    }
  }, [planes.length, cliente?.clientChoosen, Object.keys(coberturaSelections).length]);

  // Inicializar filtros globales desde el store
  useEffect(() => {
    if (planes.length > 0) {
      console.log("🔧 Inicializando filtros globales desde store:", {
        clientChoosen: cliente?.clientChoosen,
        planesCount: planes.length,
        primerasCoberturas: planes[0]?.opcionales?.map(opt => opt.nombre) || []
      });

      if (cliente?.clientChoosen === 2) {
        // Para colectivos, leer las opcionales existentes para determinar qué filtros deben estar activos
        const firstPlan = planes[0]; // Usar el primer plan como referencia
        if (firstPlan && firstPlan.opcionales.length > 0) {
          const hasAltoCosto = firstPlan.opcionales.some(opt => opt.nombre === "ALTO COSTO");
          const hasMedicamentos = firstPlan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS");
          const hasHabitacion = firstPlan.opcionales.some(opt => opt.nombre === "HABITACIÓN");
          const hasOdontologia = firstPlan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA");

          console.log("📋 Filtros detectados desde opcionales existentes:", {
            hasAltoCosto,
            hasMedicamentos,
            hasHabitacion,
            hasOdontologia,
            opcionales: firstPlan.opcionales.map(opt => ({ nombre: opt.nombre, descripcion: opt.descripcion }))
          });

          setGlobalFilters({
            altoCosto: hasAltoCosto,
            medicamentos: hasMedicamentos,
            habitacion: hasHabitacion,
            odontologia: hasOdontologia
          });
        } else {
          // Si no hay opcionales existentes, inicializar todos como false
          setGlobalFilters({
            altoCosto: false,
            medicamentos: false,
            habitacion: false,
            odontologia: false
          });
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
    }
  }, [cliente?.clientChoosen, planes.length, planes.map(p => p.opcionales.length).join(',')]);

  const updatePlanOpcionales = useCallback((planName: string, odontologiaValue: string) => {
    console.log(`🚀 updatePlanOpcionales ejecutándose:`, {
      planName,
      odontologiaValue,
      isUpdating,
      clientChoosen: cliente?.clientChoosen,
      planesDataKeys: Object.keys(planesData),
      hayDatosPlan: !!planesData[planName]
    });
    
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    setTimeout(() => {
      // Obtener planesData actual del estado
      const planDataCurrent = planesData[planName];
      if (!planDataCurrent || !planDataCurrent[0]) {
        console.log(`❌ No hay datos para el plan ${planName}:`, {
          planDataCurrent,
          planesDataKeys: Object.keys(planesData)
        });
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
      // Si es colectivo, la cantidad de afiliados la define el campo edad del primer afiliado (por requerimiento del backend)
      let cantidadAfiliados = plan.afiliados.length;
      if (cliente?.clientChoosen === 2 && plan.afiliados.length > 0) {
        const cantidad = Number(plan.afiliados[0].edad);
        cantidadAfiliados = isNaN(cantidad) ? 1 : cantidad;
      }

      // Para clientChoosen === 1 (individuales): incluir automáticamente todas las opcionales básicas
      // Para clientChoosen === 2 (colectivos): solo incluir las que están marcadas en los filtros
      if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.altoCosto)) {
        if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.altoCosto) {
          // Para colectivos, usar la selección específica del dropdown
          const selectedOption = altoCostoOptions.find(opt => opt.value === coberturaSelections[planName]?.altoCosto);
          if (selectedOption) {
            opcionales.push({
              nombre: "ALTO COSTO",
              descripcion: selectedOption.descripcion,
              prima: selectedOption.prima * cantidadAfiliados
            });
            subTotalOpcional += selectedOption.prima * cantidadAfiliados;
            console.log(`✅ ALTO COSTO INCLUIDO (COLECTIVO PERSONALIZADO) - Plan ${planName}:`, {
              prima: selectedOption.prima * cantidadAfiliados,
              descripcion: selectedOption.descripcion,
              porcentaje: selectedOption.porcentaje
            });
          }
        } else {
          // Para individuales, usar el valor estático original
          const prima = parseFloat(data.primaCosto) || 0;
          opcionales.push({
            nombre: "ALTO COSTO",
            descripcion: data.altoCosto,
            prima: prima * cantidadAfiliados
          });
          subTotalOpcional += prima * cantidadAfiliados;
          console.log(`✅ ALTO COSTO INCLUIDO - Plan ${planName}:`, {
            prima: prima * cantidadAfiliados,
            descripcion: data.altoCosto,
            clientChoosen: cliente?.clientChoosen
          });
        }
      }

      if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.medicamentos)) {
        if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.medicamentos) {
          // Para colectivos, usar la selección específica del dropdown
          const selectedOption = medicamentosOptions.find(opt => opt.value === coberturaSelections[planName]?.medicamentos);
          if (selectedOption) {
            let primaTotal = selectedOption.prima * cantidadAfiliados;
            // Sumar prima de copago si hay selección
            if (copagoSelections && copagoSelections[planName]) {
              const copagoOpt = copagoMedicamentosOptions.find(opt => opt.value === copagoSelections[planName]);
              if (copagoOpt) {
                primaTotal += copagoOpt.prima * cantidadAfiliados;
                opcionales.push({
                  nombre: "COPAGO MEDICAMENTOS",
                  descripcion: copagoOpt.label,
                  prima: copagoOpt.prima * cantidadAfiliados
                });
              }
            }
            opcionales.push({
              nombre: "MEDICAMENTOS",
              descripcion: selectedOption.descripcion,
              prima: selectedOption.prima * cantidadAfiliados
            });
            subTotalOpcional += primaTotal;
            console.log(`✅ MEDICAMENTOS INCLUIDO (COLECTIVO PERSONALIZADO) - Plan ${planName}:`, {
              prima: primaTotal,
              descripcion: selectedOption.descripcion,
              porcentaje: selectedOption.porcentaje
            });
          }
        } else {
          // Para individuales, usar el valor estático original
          const prima = parseFloat(data.medicamentoCosto) || 0;
          opcionales.push({
            nombre: "MEDICAMENTOS",
            descripcion: data.medicamento,
            prima: prima * cantidadAfiliados
          });
          subTotalOpcional += prima * cantidadAfiliados;
          console.log(`✅ MEDICAMENTOS INCLUIDO - Plan ${planName}:`, {
            prima: prima * cantidadAfiliados,
            descripcion: data.medicamento,
            clientChoosen: cliente?.clientChoosen
          });
        }
      }

      if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.habitacion)) {
        if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.habitacion) {
          // Para colectivos, usar la selección específica del dropdown
          const selectedOption = habitacionOptions.find(opt => opt.value === coberturaSelections[planName]?.habitacion);
          if (selectedOption) {
            let primaTotal = selectedOption.prima * cantidadAfiliados;
            // Sumar prima de copago si hay selección
            if (copagoHabitacionSelections && copagoHabitacionSelections[planName]) {
              const copagoOpt = copagoHabitacionOptions.find(opt => opt.value === copagoHabitacionSelections[planName]);
              if (copagoOpt) {
                primaTotal += copagoOpt.prima * cantidadAfiliados;
                opcionales.push({
                  nombre: "COPAGO HABITACIÓN",
                  descripcion: copagoOpt.label,
                  prima: copagoOpt.prima * cantidadAfiliados
                });
              }
            }
            opcionales.push({
              nombre: "HABITACIÓN",
              descripcion: selectedOption.descripcion,
              prima: selectedOption.prima * cantidadAfiliados
            });
            subTotalOpcional += primaTotal;
            console.log(`✅ HABITACIÓN INCLUIDA (COLECTIVO PERSONALIZADO) - Plan ${planName}:`, {
              prima: primaTotal,
              descripcion: selectedOption.descripcion,
              porcentaje: selectedOption.porcentaje
            });
          }
        } else {
          // Para individuales, usar el valor estático original
          const prima = parseFloat(data.habitacionCosto) || 0;
          opcionales.push({
            nombre: "HABITACIÓN",
            descripcion: data.habitacion,
            prima: prima * cantidadAfiliados
          });
          subTotalOpcional += prima * cantidadAfiliados;
          console.log(`✅ HABITACIÓN INCLUIDA - Plan ${planName}:`, {
            prima: prima * cantidadAfiliados,
            descripcion: data.habitacion,
            clientChoosen: cliente?.clientChoosen
          });
        }
      }

      // Odontología - es opcional para ambos tipos de cliente
      const odontologiaSelected = odontologiaOptions.find(opt => opt.value === odontologiaValue);
      
      if (odontologiaSelected && odontologiaSelected.value !== "0") {
        // Para clientChoosen === 1 (individuales): incluir si se selecciona explícitamente
        // Para clientChoosen === 2 (colectivos): incluir si se selecciona explícitamente O si el filtro global está activado
        const shouldIncludeOdontologia = 
          cliente?.clientChoosen === 1 || 
          (cliente?.clientChoosen === 2 && (globalFilters.odontologia || odontologiaValue !== "0"));
          
        if (shouldIncludeOdontologia) {
          opcionales.push({
            nombre: "ODONTOLOGIA",
            descripcion: odontologiaSelected.label,
            prima: odontologiaSelected.prima * cantidadAfiliados
          });
          subTotalOpcional += odontologiaSelected.prima * cantidadAfiliados;
          
          console.log(`✅ ODONTOLOGÍA INCLUIDA - Plan ${planName}:`, {
            odontologiaValue,
            descripcion: odontologiaSelected.label,
            prima: odontologiaSelected.prima * cantidadAfiliados,
            clientChoosen: cliente?.clientChoosen,
            globalFilters: globalFilters,
            razon: cliente?.clientChoosen === 1 ? "INDIVIDUAL - Selección explícita" : "COLECTIVO - Selección explícita o filtro activo"
          });
        } else {
          console.log(`❌ ODONTOLOGÍA NO INCLUIDA - Plan ${planName}:`, {
            odontologiaValue,
            odontologiaSelected: odontologiaSelected?.label,
            clientChoosen: cliente?.clientChoosen,
            globalFilters: globalFilters,
            shouldInclude: shouldIncludeOdontologia
          });
        }
      } else {
        console.log(`ℹ️ ODONTOLOGÍA NO SELECCIONADA - Plan ${planName}:`, {
          odontologiaValue,
          clientChoosen: cliente?.clientChoosen,
          mensaje: "No se incluirá porque no hay selección específica"
        });
      }

      // Actualizar el plan en el store
      const currentPlan = planes.find(p => p.plan === planName);
      if (currentPlan) {
        const subTotalAfiliado = currentPlan.resumenPago.subTotalAfiliado;
        
        console.log(`📊 RESUMEN OPCIONALES - Plan ${planName}:`, {
          clientChoosen: cliente?.clientChoosen,
          totalOpcionales: opcionales.length,
          opcionales: opcionales.map(opt => ({ nombre: opt.nombre, prima: opt.prima })),
          subTotalOpcional,
          subTotalAfiliado,
          totalPagar: subTotalAfiliado + subTotalOpcional
        });
        
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
  }, [planesData, planes, cliente, globalFilters, coberturaSelections, updatePlanByName]); // Agregar las dependencias necesarias

  // Actualizar todos los planes cuando cambian los filtros globales (solo para clientChoosen === 2)
  useEffect(() => {
    if (cliente?.clientChoosen === 2 && !isUpdating && Object.keys(planesData).length > 0) {
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
  }, [globalFilters.altoCosto, globalFilters.medicamentos, globalFilters.habitacion, globalFilters.odontologia]); // Solo dependencias de filtros

  // Actualizar automáticamente para individuales (clientChoosen === 1) cuando se cargan los datos
  useEffect(() => {
    console.log("🔧 useEffect para individuales ejecutándose:", {
      clientChoosen: cliente?.clientChoosen,
      isUpdating,
      planesDataLength: Object.keys(planesData).length,
      planSelections: Object.keys(planSelections).length,
      deberiaEjecutar: cliente?.clientChoosen === 1 && !isUpdating && Object.keys(planesData).length > 0 && Object.keys(planSelections).length > 0
    });
    
    if (cliente?.clientChoosen === 1 && !isUpdating && Object.keys(planesData).length > 0 && Object.keys(planSelections).length > 0) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan] && planSelections[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
            console.log(`📋 Ejecutando updatePlanOpcionales para individual - Plan: ${plan.plan}`);
            updatePlanOpcionales(plan.plan, odontologiaValue);
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [cliente?.clientChoosen, Object.keys(planesData).length, Object.keys(planSelections).length]); // Agregar planSelections a las dependencias

  // Actualizar planes cuando se cargan los datos por primera vez o cambia la selección de odontología
  useEffect(() => {
    if (!isUpdating && Object.keys(planesData).length > 0) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan] && planSelections[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan].odontologia || "0";
            // Solo actualizar si no hay opcionales ya guardados o si la odontología cambió
            const hasOpcionales = plan.opcionales.length > 0;
            const currentOdontologia = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA");
            const expectedOdontologia = odontologiaOptions.find(opt => opt.value === odontologiaValue);
            
            const shouldUpdate = !hasOpcionales || 
              (expectedOdontologia && currentOdontologia?.descripcion !== expectedOdontologia.label) ||
              (!expectedOdontologia && currentOdontologia) ||
              (odontologiaValue !== "0" && !currentOdontologia); // Asegurar que se incluya odontología si se seleccionó
            
            if (shouldUpdate) {
              updatePlanOpcionales(plan.plan, odontologiaValue);
            }
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [Object.keys(planesData).length, Object.keys(planSelections).length]); // Solo depender de la existencia de datos

  const handleGlobalFilterChange = (filter: string, checked: boolean) => {
    setGlobalFilters(prev => ({
      ...prev,
      [filter]: checked
    }));
  };

  const handleOdontologiaChange = (planName: string, value: string) => {
    setPlanSelections(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        odontologia: value
      }
    }));
    
    // Asegurar que se actualice inmediatamente
    setTimeout(() => {
      updatePlanOpcionales(planName, value);
    }, 50);
  };

  const handleCoberturaChange = (planName: string, coberturaType: keyof CoberturaSelections, value: string) => {
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
    }, 50);
  };

  // Estados derivados
  const isLoading = planQueriesData.some(q => q.isLoading);
  const hasError = planQueriesData.some(q => q.error);
  const isEmpty = !cliente || planes.length === 0;

  return {
    // Estados
    globalFilters,
    planSelections,
    coberturaSelections,
    copagoSelections,
    copagoHabitacionSelections,
    planesData,
    cliente,
    planes,
    odontologiaOptions,
    
    // Opciones de cobertura
    altoCostoOptions,
    medicamentosOptions,
    habitacionOptions,
    copagoMedicamentosOptions,
    copagoHabitacionOptions,
    
    // Estados derivados
    isLoading,
    hasError,
    isEmpty,
    
    // Handlers
    handleGlobalFilterChange,
    handleOdontologiaChange,
    handleCoberturaChange,
    handleCopagoChange,
    handleCopagoHabitacionChange
  };
};

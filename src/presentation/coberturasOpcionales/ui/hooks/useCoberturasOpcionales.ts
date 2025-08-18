import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
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
  { value: "0", label: "Seleccionar", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

export const useCoberturasOpcionales = () => {
  // Acceder directamente a los datos del store sin usar getFinalObject en cada render
  const { cliente, planes, updatePlanByName } = useQuotationStore();
  
  
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
  const [dynamicCopagoSelections, setDynamicCopagoSelections] = useState<{[planName: string]: string}>({});
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

  // Hooks para opciones dinámicas por tipo de cobertura (solo para colectivos)
  const isColectivo = cliente?.clientChoosen === 2;
  
  // Alto Costo
  const altoCostoOptionsQuery = useCoberturasOpcionalesByType(
    'altoCosto', 
    cliente?.tipoPlan || 1, 
    isColectivo && globalFilters.altoCosto
  );
  
  // Medicamentos
  const medicamentosOptionsQuery = useCoberturasOpcionalesByType(
    'medicamentos', 
    cliente?.tipoPlan || 1, 
    isColectivo && globalFilters.medicamentos
  );
  
  // Habitación
  const habitacionOptionsQuery = useCoberturasOpcionalesByType(
    'habitacion', 
    cliente?.tipoPlan || 1, 
    isColectivo && globalFilters.habitacion
  );
  
  // Odontología
  const odontologiaOptionsQuery = useCoberturasOpcionalesByType(
    'odontologia', 
    cliente?.tipoPlan || 1, 
    isColectivo && globalFilters.odontologia
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
            
          }
        }
        
        initialSelections[plan.plan] = {
          odontologia: odontologiaValue
        };
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
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
        setCoberturaSelections(prev => ({ ...prev, ...initialCoberturaSelections }));
      }
    }
  }, [planes.length, cliente?.clientChoosen, Object.keys(coberturaSelections).length]);

  // Inicializar filtros globales desde el store - SOLO UNA VEZ al cargar
  useEffect(() => {
    if (planes.length > 0 && !userHasModifiedFilters) {
      if (cliente?.clientChoosen === 2) {
        // Para colectivos, leer las opcionales existentes para determinar qué filtros deben estar activos
        const firstPlan = planes[0]; // Usar el primer plan como referencia
        if (firstPlan && firstPlan.opcionales.length > 0) {
          const hasAltoCosto = firstPlan.opcionales.some(opt => opt.nombre === "ALTO COSTO");
          const hasMedicamentos = firstPlan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS");
          const hasHabitacion = firstPlan.opcionales.some(opt => opt.nombre === "HABITACIÓN");
          const hasOdontologia = firstPlan.opcionales.some(opt => opt.nombre === "ODONTOLOGIA" || opt.nombre === "ODONTOLOGÍA");

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
  }, [cliente?.clientChoosen, planes.length]); // Remover dependencias que pueden causar re-ejecuciones
  // Inicializar selecciones dinámicas cuando hay datos disponibles - SOLO UNA VEZ
  useEffect(() => {
    // Inicializar selecciones dinámicas desde el store si hay opcionales guardadas
    if (cliente?.clientChoosen === 2 && planes.length > 0) {
      const newDynamicSelections: typeof dynamicCoberturaSelections = {};
      const newDynamicCopagoSelections: typeof dynamicCopagoSelections = {};
      let hasChanges = false;
      
      planes.forEach(plan => {
        // Solo procesar si no hay selecciones dinámicas ya inicializadas para este plan
        if (!dynamicCoberturaSelections[plan.plan]) {
          const opcionales = plan.opcionales || [];
          const selections = {
            altoCosto: '',
            medicamentos: '',
            habitacion: '',
            odontologia: ''
          };
          
          // Buscar selecciones existentes en las opcionales del plan
          opcionales.forEach(opcional => {
            if (opcional.nombre === "ALTO COSTO" && opcional.id) {
              selections.altoCosto = opcional.id.toString();
            } else if (opcional.nombre === "MEDICAMENTOS" && opcional.id) {
              selections.medicamentos = opcional.id.toString();
              // Si hay copago asociado, también inicializarlo
              if (opcional.idCopago) {
                newDynamicCopagoSelections[plan.plan] = opcional.idCopago.toString();
              }
            } else if (opcional.nombre === "HABITACIÓN" && opcional.id) {
              selections.habitacion = opcional.id.toString();
            }
          });
          
          newDynamicSelections[plan.plan] = selections;
          hasChanges = true;
        }
      });
      
      // Solo actualizar si hay cambios reales
      if (hasChanges && Object.keys(newDynamicSelections).length > 0) {
        setDynamicCoberturaSelections(prev => ({ ...prev, ...newDynamicSelections }));
      }
      
      if (Object.keys(newDynamicCopagoSelections).length > 0) {
        setDynamicCopagoSelections(prev => ({ ...prev, ...newDynamicCopagoSelections }));
      }
    }
  }, [cliente?.clientChoosen, planes.length]); // Simplificar dependencias

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
      let cantidadAfiliados = cliente?.clientChoosen === 2 
        ? (plan.cantidadAfiliados || 1)
        : plan.afiliados.length;

      // Multiplicador para cálculos: 1 para individuales, cantidadAfiliados para colectivos
      let multiplicadorPrima = cliente?.clientChoosen === 2 
        ? cantidadAfiliados 
        : 1;

      // Para clientChoosen === 1 (individuales): incluir automáticamente todas las opcionales básicas
      // Para clientChoosen === 2 (colectivos): solo incluir las que están marcadas en los filtros
      if (cliente?.clientChoosen === 1 || (cliente?.clientChoosen === 2 && globalFilters.altoCosto)) {
        if (cliente?.clientChoosen === 2 && dynamicCoberturaSelections[planName]?.altoCosto) {
          // Para colectivos, usar la selección específica del dropdown dinámico
          const selectedOption = altoCostoOptionsQuery.data?.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections[planName]?.altoCosto);
          if (selectedOption) {
            const primaCalculada = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
            opcionales.push({
              id: selectedOption.opt_id,
              nombre: "ALTO COSTO",
              descripcion: selectedOption.descripcion,
              prima: primaCalculada
            });
            subTotalOpcional += primaCalculada;
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
        if (cliente?.clientChoosen === 2 && dynamicCoberturaSelections[planName]?.medicamentos) {
          // Para colectivos, usar la selección específica del dropdown dinámico
          const selectedOption = medicamentosOptionsQuery.data?.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections[planName]?.medicamentos);
          if (selectedOption) {
            let primaTotal = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
            
            // Sumar prima de copago dinámico si hay selección
            if (dynamicCopagoSelections && dynamicCopagoSelections[planName]) {
              const copagoOpt = copagosQuery.data?.find(opt => opt.id.toString() === dynamicCopagoSelections[planName]);
              if (copagoOpt) {
                const primaCopago = copagoOpt.price * multiplicadorPrima;
                primaTotal += primaCopago;
                opcionales.push({
                  id: 1, // ID para Medicamentos (copago)
                  idCopago: parseInt(dynamicCopagoSelections[planName]), // ID del copago seleccionado
                  nombre: "COPAGO MEDICAMENTOS",
                  descripcion: copagoOpt.descripcion,
                  prima: primaCopago
                });
              }
            }
            opcionales.push({
              id: selectedOption.opt_id,
              idCopago: dynamicCopagoSelections[planName] ? parseInt(dynamicCopagoSelections[planName]) : undefined,
              nombre: "MEDICAMENTOS",
              descripcion: selectedOption.descripcion,
              prima: parseFloat(selectedOption.opt_prima) * multiplicadorPrima
            });
            subTotalOpcional += primaTotal;
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
        if (cliente?.clientChoosen === 2 && dynamicCoberturaSelections[planName]?.habitacion) {
          // Para colectivos, usar la selección específica del dropdown dinámico
          const selectedOption = habitacionOptionsQuery.data?.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections[planName]?.habitacion);
          if (selectedOption) {
            let primaCalculada = parseFloat(selectedOption.opt_prima) * multiplicadorPrima;
            
            opcionales.push({
              id: selectedOption.opt_id,
              nombre: "HABITACIÓN",
              descripcion: selectedOption.descripcion,
              prima: primaCalculada
            });
            subTotalOpcional += primaCalculada;
           
          }
        } else if (cliente?.clientChoosen === 2 && coberturaSelections[planName]?.habitacion) {
          // Ya no hay fallback estático - solo datos dinámicos
        } else {
          // Para individuales, usar el valor estático original SIN multiplicar por cantidad de afiliados
          const prima = parseFloat(data.habitacionCosto) || 0;
          const primaCalculada = prima * multiplicadorPrima;
          opcionales.push({
            id: 3, // ID para Habitación
            nombre: "HABITACIÓN",
            descripcion: data.habitacion,
            prima: primaCalculada
          });
          subTotalOpcional += primaCalculada;
         
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
          const primaCalculada = odontologiaSelected.prima * multiplicadorPrima;
          opcionales.push({
            id: 4, // ID para Odontología
            nombre: "ODONTOLOGIA",
            descripcion: odontologiaSelected.label,
            prima: primaCalculada
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
    }, 100);
  }, [
    planesData, 
    planes, 
    cliente, 
    globalFilters, 
    coberturaSelections, 
    dynamicCoberturaSelections, 
    dynamicCopagoSelections,
    altoCostoOptionsQuery.data,
    medicamentosOptionsQuery.data,
    habitacionOptionsQuery.data,
    copagosQuery.data,
    updatePlanByName
  ]); // Agregar las dependencias necesarias incluyendo las dinámicas

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
        
        // Limpiar copago relacionado si es medicamentos
        if (filter === 'medicamentos') {
          setDynamicCopagoSelections(prev => ({
            ...prev,
            [plan.plan]: ''
          }));
        }
        
      });
    }
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

  // Nuevos handlers para selecciones dinámicas
  const handleDynamicCoberturaChange = (planName: string, coberturaType: string, value: string) => {
    setDynamicCoberturaSelections(prev => ({
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

  const handleDynamicCopagoChange = (planName: string, value: string) => {
    setDynamicCopagoSelections(prev => ({
      ...prev,
      [planName]: value
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

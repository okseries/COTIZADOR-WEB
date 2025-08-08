import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import { usePlanesOpcionales } from '../../hooks/usePlanesOpcionales';
import { CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';
import { OdontologiaOption } from '../components/OdontologiaSelect';

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
  const [planesData, setPlanesData] = useState<{[planName: string]: CoberturasOpcional[]}>({});
  const [isUpdating, setIsUpdating] = useState(false);

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
  }, [planes.length]); // Solo depender del número de planes para evitar bucles

  // Inicializar filtros globales desde el store
  useEffect(() => {
    if (cliente?.clientChoosen === 2 && planes.length > 0) {
      const hasAltoCosto = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ALTO COSTO"));
      const hasMedicamentos = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS"));
      const hasHabitacion = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "HABITACIÓN"));
      const hasOdontologia = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ODONTOLOGÍA" || opt.nombre === "ODONTOLOGIA"));
      
      setGlobalFilters({
        altoCosto: hasAltoCosto,
        medicamentos: hasMedicamentos,
        habitacion: hasHabitacion,
        odontologia: hasOdontologia
      });
    }
  }, [cliente?.clientChoosen, planes]);

  const updatePlanOpcionales = useCallback((planName: string, odontologiaValue: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    setTimeout(() => {
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
      const cantidadAfiliados = plan.afiliados.length;

      // Solo agregar las coberturas que están filtradas (para clientChoosen === 2) o todas (para clientChoosen === 1)
      if (cliente?.clientChoosen === 1 || globalFilters.altoCosto) {
        const prima = parseFloat(data.primaCosto) || 0;
        opcionales.push({
          nombre: "ALTO COSTO",
          descripcion: data.altoCosto,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      if (cliente?.clientChoosen === 1 || globalFilters.medicamentos) {
        const prima = parseFloat(data.medicamentoCosto) || 0;
        opcionales.push({
          nombre: "MEDICAMENTOS",
          descripcion: data.medicamento,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      if (cliente?.clientChoosen === 1 || globalFilters.habitacion) {
        const prima = parseFloat(data.habitacionCosto) || 0;
        opcionales.push({
          nombre: "HABITACIÓN",
          descripcion: data.habitacion,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      // Odontología - siempre verificar si hay una selección válida
      const odontologiaSelected = odontologiaOptions.find(opt => opt.value === odontologiaValue);
      if (odontologiaSelected && odontologiaSelected.value !== "0") {
        // Incluir odontología si:
        // 1. clientChoosen === 1 (siempre incluir todas las opcionales)
        // 2. clientChoosen === 2 Y globalFilters.odontologia === true (filtro activado)
        // 3. O si hay una selección específica de odontología (independientemente del filtro)
        if (cliente?.clientChoosen === 1 || globalFilters.odontologia || odontologiaValue !== "0") {
          opcionales.push({
            nombre: "ODONTOLOGIA",
            descripcion: odontologiaSelected.label,
            prima: odontologiaSelected.prima * cantidadAfiliados
          });
          subTotalOpcional += odontologiaSelected.prima * cantidadAfiliados;
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
  }, []); // Dependencias vacías, usar valores capturados por closures

  // Actualizar todos los planes cuando cambian los filtros globales
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

  // Estados derivados
  const isLoading = planQueriesData.some(q => q.isLoading);
  const hasError = planQueriesData.some(q => q.error);
  const isEmpty = !cliente || planes.length === 0;

  return {
    // Estados
    globalFilters,
    planSelections,
    planesData,
    cliente,
    planes,
    odontologiaOptions,
    
    // Estados derivados
    isLoading,
    hasError,
    isEmpty,
    
    // Handlers
    handleGlobalFilterChange,
    handleOdontologiaChange
  };
};

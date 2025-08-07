import { useState, useEffect } from 'react';
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
  const { cliente, planes } = getFinalObject();
  
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

  // Hacer petición para cada plan
  const planQueries = planes.map(plan => ({
    planName: plan.plan,
    query: usePlanesOpcionales(plan.plan, cliente?.tipoPlan || 1, cliente?.clientChoosen || 1)
  }));

  // Cargar datos de las peticiones
  useEffect(() => {
    const newPlanesData: {[planName: string]: CoberturasOpcional[]} = {};
    let hasChanges = false;
    
    planQueries.forEach(({ planName, query }) => {
      if (query.data) {
        newPlanesData[planName] = query.data;
        if (!planesData[planName] || JSON.stringify(planesData[planName]) !== JSON.stringify(query.data)) {
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setPlanesData(newPlanesData);
    }
  }, [planQueries.map(q => q.query.data).join(',')]);

  // Inicializar selecciones de odontología para cada plan
  useEffect(() => {
    const initialSelections: {[planName: string]: {[key: string]: string}} = {};
    let needsUpdate = false;
    
    planes.forEach(plan => {
      if (!planSelections[plan.plan]) {
        const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA");
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
  }, [planes.length]);

  // Inicializar filtros globales desde el store
  useEffect(() => {
    if (cliente?.clientChoosen === 2 && planes.length > 0) {
      const hasAltoCosto = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ALTO COSTO"));
      const hasMedicamentos = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS"));
      const hasHabitacion = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "HABITACIÓN"));
      const hasOdontologia = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ODONTOLOGÍA"));
      
      setGlobalFilters({
        altoCosto: hasAltoCosto,
        medicamentos: hasMedicamentos,
        habitacion: hasHabitacion,
        odontologia: hasOdontologia
      });
    }
  }, [cliente?.clientChoosen, planes.length]);

  const updatePlanOpcionales = (planName: string, odontologiaValue: string) => {
    if (isUpdating) return;
    
    const planData = planesData[planName];
    if (!planData || !planData[0]) return;

    setIsUpdating(true);
    
    const opcionales: Opcional[] = [];
    const data = planData[0];
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

    // Odontología
    if (cliente?.clientChoosen === 1 || globalFilters.odontologia) {
      const odontologiaSelected = odontologiaOptions.find(opt => opt.value === odontologiaValue);
      if (odontologiaSelected && odontologiaSelected.value !== "0") {
        opcionales.push({
          nombre: "ODONTOLOGÍA",
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
    
    setTimeout(() => setIsUpdating(false), 100);
  };

  // Actualizar todos los planes cuando cambian los filtros globales
  useEffect(() => {
    if (cliente?.clientChoosen === 2 && !isUpdating) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
            updatePlanOpcionales(plan.plan, odontologiaValue);
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [globalFilters.altoCosto, globalFilters.medicamentos, globalFilters.habitacion, globalFilters.odontologia]);

  // Actualizar planes cuando se cargan los datos por primera vez o cambia la selección de odontología
  useEffect(() => {
    if (!isUpdating && Object.keys(planesData).length > 0) {
      const timer = setTimeout(() => {
        planes.forEach(plan => {
          if (planesData[plan.plan] && planSelections[plan.plan]) {
            const odontologiaValue = planSelections[plan.plan].odontologia || "0";
            // Solo actualizar si no hay opcionales ya guardados o si la odontología cambió
            const hasOpcionales = plan.opcionales.length > 0;
            const currentOdontologia = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA");
            const expectedOdontologia = odontologiaOptions.find(opt => opt.value === odontologiaValue);
            
            const shouldUpdate = !hasOpcionales || 
              (expectedOdontologia && currentOdontologia?.descripcion !== expectedOdontologia.label) ||
              (!expectedOdontologia && currentOdontologia);
            
            if (shouldUpdate) {
              updatePlanOpcionales(plan.plan, odontologiaValue);
            }
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [Object.keys(planesData).join(','), JSON.stringify(planSelections)]);

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
    updatePlanOpcionales(planName, value);
  };

  // Estados derivados
  const isLoading = planQueries.some(q => q.query.isLoading);
  const hasError = planQueries.some(q => q.query.error);
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

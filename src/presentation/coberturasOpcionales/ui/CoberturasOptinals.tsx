"use client"
import React from 'react'
import { useCoberturasOpcionales } from './hooks/useCoberturasOpcionales';
import GlobalFilters from './components/GlobalFilters';
import PlanTable from './components/PlanTable';
import LoadingState from './components/LoadingState';

const CoberturasOpcionales = () => {
  const {
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
    dynamicAltoCostoOptions,
    dynamicMedicamentosOptions,
    dynamicHabitacionOptions,
    dynamicOdontologiaOptions,
    dynamicCopagosOptions,
    dynamicCopagosAltoCostoOptions,
    dynamicCopagosHabitacionOptions,
    
    isLoading,
    hasError,
    isEmpty,
    handleGlobalFilterChange,
    handleOdontologiaChange,
    handleCoberturaChange,
    handleCopagoChange,
    handleCopagoHabitacionChange,
    handleDynamicCoberturaChange,
    handleDynamicCopagoChange
  } = useCoberturasOpcionales();

  // 🔍 DEBUG: Verificar las opciones dinámicas que recibe el componente
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔍 CoberturasOptionals recibe:', {
  //     dynamicHabitacionOptions: dynamicHabitacionOptions?.length || 0,
  //     dynamicAltoCostoOptions: dynamicAltoCostoOptions?.length || 0,
  //     dynamicMedicamentosOptions: dynamicMedicamentosOptions?.length || 0,
  //     habitacionData: dynamicHabitacionOptions?.slice(0, 2)
  //   });
  // }

  // Mostrar estados de carga/error/vacío
  if (isEmpty || isLoading || hasError) {
    return (
      <LoadingState 
        isLoading={isLoading} 
        hasError={hasError} 
        isEmpty={isEmpty} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros globales */}
      <GlobalFilters
        filters={globalFilters}
        onFilterChange={handleGlobalFilterChange}
        clientChoosen={cliente?.clientChoosen || 1}
      />

      {/* Tablas por plan */}
      {planes.map(plan => {
        const planData = planesData[plan.plan];
        const odontologiaSelection = planSelections[plan.plan]?.odontologia || "0";
        const coberturaSelection = coberturaSelections[plan.plan];
        const copagoSelection = copagoSelections[plan.plan] || "";
        const copagoHabitacionSelection = copagoHabitacionSelections[plan.plan] || "";
        
        // Selecciones dinámicas - FIX: Asegurar que siempre haya un objeto válido
        const dynamicCoberturaSelection = dynamicCoberturaSelections[plan.plan] || {
          altoCosto: '',
          medicamentos: '',
          habitacion: '',
          odontologia: ''
        };
        const dynamicCopagoSelection = dynamicCopagoSelections[plan.plan] || { altoCosto: '', medicamentos: '', habitacion: '' };
        
        // 🔍 DEBUG CRÍTICO: Log exacto de valores que se pasan a PlanTable
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 CoberturasOptionals - Valores para PlanTable [${plan.plan}]:`, JSON.stringify({
            planName: plan.plan,
            odontologiaSelection,
            dynamicCoberturaSelection,
            dynamicCopagoSelection,
            optionsAvailable: {
              altoCosto: dynamicAltoCostoOptions?.length || 0,
              medicamentos: dynamicMedicamentosOptions?.length || 0,
              habitacion: dynamicHabitacionOptions?.length || 0,
              copagosOptions: dynamicCopagosOptions?.length || 0,
              copagosAltoCosto: dynamicCopagosAltoCostoOptions?.length || 0,
              copagosHabitacion: dynamicCopagosHabitacionOptions?.length || 0
            },
            timestamp: new Date().toISOString()
          }, null, 2));
        }
        
        return (
          <PlanTable
            key={plan.plan}
            planName={plan.plan}
            planData={planData}
            plan={plan}
            cliente={cliente}
            clientChoosen={cliente?.clientChoosen || 1}
            globalFilters={globalFilters}
            odontologiaSelection={odontologiaSelection}
            odontologiaOptions={odontologiaOptions}
            coberturaSelections={coberturaSelection}
            copagoSelection={copagoSelection}
            copagoHabitacionSelection={copagoHabitacionSelection}
            
            // Nuevas props dinámicas
            dynamicCoberturaSelections={dynamicCoberturaSelection}
            dynamicCopagoSelection={dynamicCopagoSelection}
            dynamicAltoCostoOptions={dynamicAltoCostoOptions}
            dynamicMedicamentosOptions={dynamicMedicamentosOptions}
            dynamicHabitacionOptions={dynamicHabitacionOptions}
            dynamicOdontologiaOptions={dynamicOdontologiaOptions}
            dynamicCopagosOptions={dynamicCopagosOptions}
            dynamicCopagosAltoCostoOptions={dynamicCopagosAltoCostoOptions}
            dynamicCopagosHabitacionOptions={dynamicCopagosHabitacionOptions}
            
            onOdontologiaChange={handleOdontologiaChange}
            onCoberturaChange={handleCoberturaChange}
            onCopagoChange={handleCopagoChange}
            onCopagoHabitacionChange={handleCopagoHabitacionChange}
            onDynamicCoberturaChange={handleDynamicCoberturaChange}
            onDynamicCopagoChange={handleDynamicCopagoChange}
          />
        );
      })}
    </div>
  );
}

export default CoberturasOpcionales

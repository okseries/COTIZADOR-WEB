"use client"
import React, { forwardRef, useImperativeHandle } from 'react'
import { useCoberturasOpcionales } from './hooks/useCoberturasOpcionales';
import { useQuotationStore } from '@/core/store/quotationStore';
import GlobalFilters from './components/GlobalFilters';
import PlanTable from './components/PlanTable';
import LoadingState from './components/LoadingState';

// 🆕 INTERFACE PARA REF
export interface CoberturasOpcionalesRef {
  validateAndSave: () => Promise<boolean>;
}

const CoberturasOpcionales = forwardRef<CoberturasOpcionalesRef, {}>((_props, ref) => {
  // Obtener mode del store y convertir a string
  const storeMode = useQuotationStore((state) => state.mode);
  const mode = storeMode === "create" ? "create" : "edit";
  
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
    ODONTOLOGIA_OPTIONS,
    
    // Opciones dinámicas desde API
    dynamicAltoCostoOptions,
    dynamicMedicamentosOptions,
    dynamicHabitacionOptions,
    dynamicODONTOLOGIA_OPTIONS: dynamicOdontologiaOptions,
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
    handleDynamicCopagoChange,
    
    // 🆕 FUNCIÓN DE VALIDACIÓN
    validateAndSaveToStore
  } = useCoberturasOpcionales({ mode });

  // 🆕 EXPONER FUNCIÓN DE VALIDACIÓN AL PADRE
  useImperativeHandle(ref, () => ({
    validateAndSave: validateAndSaveToStore
  }), [validateAndSaveToStore]);

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
      {planes.map((plan: any) => {
        const planData = planesData[plan.plan];
        const odontologiaSelection = planSelections[plan.plan]?.odontologia || "0";
        const coberturaSelection = coberturaSelections[plan.plan];
        const copagoSelection = copagoSelections[plan.plan] || "";
        const copagoHabitacionSelection = copagoHabitacionSelections[plan.plan] || "";
        
        // 🔍 DEBUG SIMPLIFICADO: Solo mostrar si hay problemas
        if (process.env.NODE_ENV === 'development' && !planSelections[plan.plan]) {
          console.log(`❌ PROBLEMA EN PLAN ${plan.plan}:`, {
            odontologiaSelection,
            planSelectionsForPlan: planSelections[plan.plan],
            hasOdontologiaOptions: ODONTOLOGIA_OPTIONS?.length > 0
          });
        }
        
        // Selecciones dinámicas - FIX: Asegurar que siempre haya un objeto válido
        const dynamicCoberturaSelection = dynamicCoberturaSelections[plan.plan] || {
          altoCosto: '',
          medicamentos: '',
          habitacion: '',
          odontologia: ''
        };
        const dynamicCopagoSelection = dynamicCopagoSelections[plan.plan] || { altoCosto: '', medicamentos: '', habitacion: '' };
        
        // DEBUG: Log de selecciones dinámicas para este plan
        console.log(`🔍 SELECCIONES DINÁMICAS PARA ${plan.plan}:`, {
          coberturas: dynamicCoberturaSelection,
          copagos: dynamicCopagoSelection,
          opcionesDisponibles: {
            altoCosto: dynamicAltoCostoOptions?.length || 0,
            medicamentos: dynamicMedicamentosOptions?.length || 0,
            habitacion: dynamicHabitacionOptions?.length || 0
          }
        });
        
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
            odontologiaOptions={ODONTOLOGIA_OPTIONS}
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
});

CoberturasOpcionales.displayName = 'CoberturasOpcionales';

export default CoberturasOpcionales;

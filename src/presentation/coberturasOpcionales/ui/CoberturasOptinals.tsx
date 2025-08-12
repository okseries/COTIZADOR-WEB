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
    planesData,
    cliente,
    planes,
    odontologiaOptions,
    altoCostoOptions,
    medicamentosOptions,
    habitacionOptions,
    isLoading,
    hasError,
    isEmpty,
    handleGlobalFilterChange,
    handleOdontologiaChange,
    handleCoberturaChange
  } = useCoberturasOpcionales();

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
        
        return (
          <PlanTable
            key={plan.plan}
            planName={plan.plan}
            planData={planData}
            plan={plan}
            clientChoosen={cliente?.clientChoosen || 1}
            globalFilters={globalFilters}
            odontologiaSelection={odontologiaSelection}
            odontologiaOptions={odontologiaOptions}
            coberturaSelections={coberturaSelection}
            altoCostoOptions={altoCostoOptions}
            medicamentosOptions={medicamentosOptions}
            habitacionOptions={habitacionOptions}
            onOdontologiaChange={handleOdontologiaChange}
            onCoberturaChange={handleCoberturaChange}
          />
        );
      })}
    </div>
  );
}

export default CoberturasOpcionales

import { useMemo } from 'react';
import { useQuotationStore, isStepValid, isQuotationComplete } from './quotationStore';

// Selectores básicos (sin llamadas de función para evitar bucles infinitos)
export const useCurrentStep = () => useQuotationStore((state) => state.currentStep);
export const useMode = () => useQuotationStore((state) => state.mode);

// Selectores para datos principales
export const useUser = () => useQuotationStore((state) => state.user);
export const useCliente = () => useQuotationStore((state) => state.cliente);
export const usePlanes = () => useQuotationStore((state) => state.planes);
export const useFilterData = () => useQuotationStore((state) => state.filterData);
export const useAgentOptions = () => useQuotationStore((state) => state.agentOptions);

// Selectores para datos del stepper
export const useClientData = () => useQuotationStore((state) => state.clientData);
export const useSelectedPlans = () => useQuotationStore((state) => state.selectedPlans);
export const useOptionalCoverages = () => useQuotationStore((state) => state.selectedOptionalCoverages);
export const usePaymentPeriod = () => useQuotationStore((state) => state.paymentPeriod);

// Hooks de validación optimizados que usan las funciones helper
export const useIsStepValid = (step: string) => {
  const state = useQuotationStore();
  return useMemo(() => isStepValid(step, state), [step, state]);
};

export const useIsComplete = () => {
  const state = useQuotationStore();
  return useMemo(() => isQuotationComplete(state), [state]);
};

// Selectores compuestos optimizados con useMemo
export const useQuotationSummary = () => {
  const cliente = useCliente();
  const planes = usePlanes();
  
  return useMemo(() => ({
    cliente,
    planes,
    isComplete: !!cliente && planes.length > 0
  }), [cliente, planes]);
};

// Hook para obtener toda la información de validación de pasos - optimizado
export const useStepValidation = () => {
  const state = useQuotationStore();
  
  return useMemo(() => ({
    isStep1Valid: isStepValid('step1', state),
    isStep2Valid: isStepValid('step2', state),
    isStep3Valid: isStepValid('step3', state),
    isStep4Valid: isStepValid('step4', state),
    isComplete: isQuotationComplete(state)
  }), [state]);
};

export const useStepperSummary = () => {
  const currentStep = useCurrentStep();
  const clientData = useClientData();
  const selectedPlans = useSelectedPlans();
  const paymentPeriod = usePaymentPeriod();
  const state = useQuotationStore();
  
  return useMemo(() => ({
    currentStep,
    clientData,
    selectedPlans,
    paymentPeriod,
    isValid: isStepValid(currentStep, state)
  }), [currentStep, clientData, selectedPlans, paymentPeriod, state]);
};

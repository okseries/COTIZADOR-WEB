import { useMemo } from 'react';
import { useQuotationStore, isStepValid } from '../store/quotationStore';
import { useCurrentStep } from '../store/selectors';

export const useStepNavigation = () => {
  const currentStep = useCurrentStep();
  const setCurrentStep = useQuotationStore((state) => state.setCurrentStep);
  
  // Obtener el estado completo solo una vez
  const state = useQuotationStore();
  
  // Memorizar valores derivados para evitar recálculos innecesarios
  const navigationData = useMemo(() => {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const currentStepIndex = steps.indexOf(currentStep);
    const isCurrentStepValid = isStepValid(currentStep, state);
    
    return {
      steps,
      currentStepIndex,
      isCurrentStepValid,
      canGoNext: currentStepIndex < steps.length - 1 && isCurrentStepValid,
      canGoPrev: currentStepIndex > 0,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === steps.length - 1,
      totalSteps: steps.length
    };
  }, [currentStep, state]);
  
  // Memorizar funciones de navegación
  const navigationActions = useMemo(() => ({
    nextStep: () => {
      if (navigationData.canGoNext) {
        setCurrentStep(navigationData.steps[navigationData.currentStepIndex + 1]);
      }
    },
    
    prevStep: () => {
      if (navigationData.canGoPrev) {
        setCurrentStep(navigationData.steps[navigationData.currentStepIndex - 1]);
      }
    },
    
    goToStep: (step: string) => {
      if (navigationData.steps.includes(step)) {
        setCurrentStep(step);
      }
    }
  }), [setCurrentStep, navigationData]);
  
  return {
    currentStep,
    setCurrentStep,
    ...navigationData,
    ...navigationActions
  };
};

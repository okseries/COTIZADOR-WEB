import { useQuotationStore } from '../store/quotationStore';
import { useOptionalCoverages, usePaymentPeriod } from '../store/selectors';

export const useCoverageManagement = () => {
  const optionalCoverages = useOptionalCoverages();
  const paymentPeriod = usePaymentPeriod();
  
  const setOptionalCoverages = useQuotationStore((state) => state.setOptionalCoverages);
  const setPaymentPeriod = useQuotationStore((state) => state.setPaymentPeriod);
  const removeSelectedPlan = useQuotationStore((state) => state.removeSelectedPlan);
  const updateSelectedPlan = useQuotationStore((state) => state.updateSelectedPlan);
  
  const getPlanCoverages = (planId: string) => {
    return optionalCoverages[planId] || [];
  };
  
  const addCoverageToPlan = (planId: string, coverageId: number) => {
    const currentCoverages = getPlanCoverages(planId);
    if (!currentCoverages.includes(coverageId)) {
      setOptionalCoverages(planId, [...currentCoverages, coverageId]);
    }
  };
  
  const removeCoverageFromPlan = (planId: string, coverageId: number) => {
    const currentCoverages = getPlanCoverages(planId);
    setOptionalCoverages(planId, currentCoverages.filter(id => id !== coverageId));
  };
  
  const toggleCoverageForPlan = (planId: string, coverageId: number) => {
    const currentCoverages = getPlanCoverages(planId);
    if (currentCoverages.includes(coverageId)) {
      removeCoverageFromPlan(planId, coverageId);
    } else {
      addCoverageToPlan(planId, coverageId);
    }
  };
  
  const clearPlanCoverages = (planId: string) => {
    setOptionalCoverages(planId, []);
  };
  
  const hasCoverage = (planId: string, coverageId: number) => {
    return getPlanCoverages(planId).includes(coverageId);
  };
  
  return {
    // State
    optionalCoverages,
    paymentPeriod,
    
    // Actions
    setOptionalCoverages,
    setPaymentPeriod,
    removeSelectedPlan,
    updateSelectedPlan,
    
    // Utils
    getPlanCoverages,
    addCoverageToPlan,
    removeCoverageFromPlan,
    toggleCoverageForPlan,
    clearPlanCoverages,
    hasCoverage
  };
};

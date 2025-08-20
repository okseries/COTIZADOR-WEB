import { useMemo } from 'react';
import { useQuotationStore, isQuotationComplete } from '../store/quotationStore';
import { 
  useCliente, 
  usePlanes, 
  useClientData, 
  useSelectedPlans, 
  useQuotationSummary 
} from '../store/selectors';

export const useQuotationData = () => {
  const cliente = useCliente();
  const planes = usePlanes();
  const clientData = useClientData();
  const selectedPlans = useSelectedPlans();
  const summary = useQuotationSummary();
  
  // Acciones del store (estas son estables y no cambian)
  const setCliente = useQuotationStore((state) => state.setCliente);
  const setClientData = useQuotationStore((state) => state.setClientData);
  const addPlan = useQuotationStore((state) => state.addPlan);
  const addSelectedPlan = useQuotationStore((state) => state.addSelectedPlan);
  const updateLastPlan = useQuotationStore((state) => state.updateLastPlan);
  const updatePlanByName = useQuotationStore((state) => state.updatePlanByName);
  const removePlan = useQuotationStore((state) => state.removePlan);
  const clearQuotation = useQuotationStore((state) => state.clearQuotation);
  
  // Memorizar el estado completo solo cuando sea necesario
  const state = useQuotationStore();
  const isComplete = useMemo(() => isQuotationComplete(state), [state]);
  
  // Memorizar las acciones para evitar recrearlas en cada render
  const actions = useMemo(() => ({
    setCliente,
    setClientData,
    addPlan,
    addSelectedPlan,
    updateLastPlan,
    updatePlanByName,
    removePlan,
    clearQuotation,
  }), [setCliente, setClientData, addPlan, addSelectedPlan, updateLastPlan, updatePlanByName, removePlan, clearQuotation]);
  
  return {
    // Data
    cliente,
    planes,
    clientData,
    selectedPlans,
    summary,
    
    // Actions (memoizadas)
    ...actions,
    
    // Utils
    isComplete
  };
};

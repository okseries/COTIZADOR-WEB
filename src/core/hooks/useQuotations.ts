import { useQuotationStore } from '../store/quotationStore';
import { useMode, useUser, useFilterData } from '../store/selectors';
import type { QuotationRequest } from '../types/quotation';

export const useQuotations = () => {
  const mode = useMode();
  const user = useUser();
  const filterData = useFilterData();
  
  const setMode = useQuotationStore((state) => state.setMode);
  const setUser = useQuotationStore((state) => state.setUser);
  const setFilterData = useQuotationStore((state) => state.setFilterData);
  const loadExistingQuotation = useQuotationStore((state) => state.loadExistingQuotation);
  const getFinalObject = useQuotationStore((state) => state.getFinalObject);
  const clearQuotation = useQuotationStore((state) => state.clearQuotation);
  
  const createNewQuotation = () => {
    clearQuotation();
    setMode("create");
  };
  
  const editQuotation = (quotationId: number, quotationData: QuotationRequest) => {
    // Primero establecer el modo de edición
    setMode(quotationId);
    // Luego cargar los datos existentes
    loadExistingQuotation(quotationData);
  };
  
  const saveQuotation = () => {
    return getFinalObject();
  };
  
  // Nota: generateQuotationObject fue removido del store ya que causaba bucles infinitos
  // Esta funcionalidad debe implementarse fuera del store si es necesaria
  
  return {
    // State
    mode,
    user,
    filterData,
    isCreateMode: mode === "create",
    isEditMode: typeof mode === "number",
    
    // Actions
    setMode,
    setUser,
    setFilterData,
    loadExistingQuotation,
    createNewQuotation,
    editQuotation,
    saveQuotation,
    clearQuotation
  };
};

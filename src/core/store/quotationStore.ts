import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UnifiedQuotationState, 
  QuotationRequest, 
  FilterData, 
  QuotationMode,
  Cliente,
  Plan,
  ClienteFormValues,
  PlanFormValues
} from '../types/quotation';

// Función para limpiar localStorage de versiones anteriores
const cleanupOldStorage = () => {
  if (typeof window !== 'undefined') {
    // Lista de claves de localStorage que podrían causar conflictos
    const oldKeys = [
      'quotation-storage',
      'stepper-storage', 
      'unified-quotation-storage',
      'quotation-store',
      'stepper-store'
    ];
    
    oldKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Error cleaning up old storage:', error);
      }
    });
  }
};

// Limpiar almacenamiento anterior una sola vez
let hasCleanedUp = false;
if (!hasCleanedUp) {
  cleanupOldStorage();
  hasCleanedUp = true;
}

// Acciones del store
interface QuotationActions {
  // Modo y navegación
  setMode: (mode: QuotationMode) => void;
  setCurrentStep: (step: string) => void;
  
  // Datos principales
  setUser: (user: string) => void;
  setCliente: (cliente: Cliente) => void;
  setFilterData: (filterData: FilterData) => void;
  setAgentOptions: (agents: unknown[]) => void;
  
  // 🆕 Búsqueda de clientes (consolidación)
  setSearchData: (data: { tipoDocumento: string; identificacion: string }) => void;
  setClientSearchResult: (data: { NOMBRE_COMPLETO: string } | null) => void;
  clearClientSearch: () => void;
  
  // Gestión de planes (compatibilidad con store anterior)
  addPlan: (plan: Plan) => void;
  updateLastPlan: (plan: Partial<Plan>) => void;
  updatePlanByName: (planName: string, update: Partial<Plan>) => void;
  removePlan: (planName: string) => void;
  
  // Datos del stepper
  setClientData: (data: Partial<ClienteFormValues>) => void;
  addSelectedPlan: (plan: PlanFormValues) => void;
  removeSelectedPlan: (planId: string) => void;
  updateSelectedPlan: (planId: string, plan: PlanFormValues) => void;
  setOptionalCoverages: (planId: string, coverageIds: number[]) => void;
  setPaymentPeriod: (period: string) => void;
  
  // Utilidades
  clearQuotation: () => void;
  clearCurrentForm: () => void;
  loadExistingQuotation: (quotationRequest: QuotationRequest) => void;
  getFinalObject: () => QuotationRequest;
  resetStepper: () => void;
}

type QuotationStore = UnifiedQuotationState & QuotationActions;

const initialState: UnifiedQuotationState = {
  mode: "create",
  currentStep: 'step1',
  user: null,
  cliente: null,
  planes: [],
  filterData: null,
  agentOptions: [],
  searchData: null,
  clientSearchResult: null,
  clientData: {
    clientChoosen: 0,
    identification: '',
    name: '',
    contact: '',
    email: '',
    address: '',
    office: '',
    agent: '',
    tipoPlan: 0,
  },
  selectedPlans: [],
  selectedOptionalCoverages: {},
  paymentPeriod: '',
};

// Función helper para validar pasos (fuera del store)
export const isStepValid = (step: string, state: UnifiedQuotationState): boolean => {
  switch (step) {
    case 'step1':
      // Usar los datos del cliente (que se actualizan en tiempo real)
      return !!(
        state.cliente?.clientChoosen &&
        state.cliente?.identification &&
        state.cliente?.name &&
        state.cliente?.contact &&
        state.cliente?.email &&
        state.cliente?.office &&
        state.cliente?.agent &&
        state.cliente?.tipoPlan
      );
    
    case 'step2':
      // Validar que hay planes seleccionados Y que al menos uno tiene afiliados
      if (!state.planes || state.planes.length === 0) {
        return false;
      }
      // Verificar que al menos un plan tiene afiliados
      return state.planes.some(plan => plan.afiliados && plan.afiliados.length > 0);
    
    case 'step3':
      return true; // Los opcionales son opcionales
    
    case 'step4':
      return !!(state.paymentPeriod && state.paymentPeriod !== '');
    
    default:
      return false;
  }
};

// Función helper para verificar si está completo (fuera del store)
export const isQuotationComplete = (state: UnifiedQuotationState): boolean => {
  return !!state.cliente && state.planes.length > 0;
};

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Modo y navegación
      setMode: (mode) => set({ mode }),
      setCurrentStep: (step) => set({ currentStep: step }),
      
      // Datos principales
      setUser: (user) => set({ user }),
      setCliente: (cliente) => set({ cliente }),
      setFilterData: (filterData) => set({ filterData }),
      setAgentOptions: (agentOptions) => set({ agentOptions }),
      
      // 🆕 Búsqueda de clientes (consolidación)
      setSearchData: (data) => set({ searchData: data }),
      setClientSearchResult: (data) => set({ clientSearchResult: data }),
      clearClientSearch: () => set({ searchData: null, clientSearchResult: null }),
      
      // Gestión de planes (compatibilidad con store anterior)
      addPlan: (plan) => set((state) => ({ 
        planes: [...state.planes, plan] 
      })),
      
      updateLastPlan: (planUpdate) =>
        set((state) => {
          const updatedPlanes = [...state.planes];
          if (updatedPlanes.length > 0) {
            const lastIndex = updatedPlanes.length - 1;
            updatedPlanes[lastIndex] = {
              ...updatedPlanes[lastIndex],
              ...planUpdate,
            };
          }
          return { planes: updatedPlanes };
        }),
      
      updatePlanByName: (planName, update) =>
        set((state) => ({
          planes: state.planes.map((p) =>
            p.plan === planName ? { ...p, ...update } : p
          ),
        })),
      
      removePlan: (planName) =>
        set((state) => ({
          planes: state.planes.filter((p) => p.plan !== planName),
        })),
      
      // Datos del stepper
      setClientData: (data) => 
        set((state) => ({
          clientData: { ...state.clientData, ...data }
        })),
      
      addSelectedPlan: (plan) =>
        set((state) => ({
          selectedPlans: [...state.selectedPlans, plan]
        })),
      
      removeSelectedPlan: (planId) =>
        set((state) => {
          const newOptionalCoverages = { ...state.selectedOptionalCoverages };
          delete newOptionalCoverages[planId];
          
          return {
            selectedPlans: state.selectedPlans.filter(p => p.plan !== planId),
            selectedOptionalCoverages: newOptionalCoverages
          };
        }),
      
      updateSelectedPlan: (planId, plan) =>
        set((state) => ({
          selectedPlans: state.selectedPlans.map(p => 
            p.plan === planId ? plan : p
          )
        })),
      
      setOptionalCoverages: (planId, coverageIds) =>
        set((state) => ({
          selectedOptionalCoverages: {
            ...state.selectedOptionalCoverages,
            [planId]: coverageIds
          }
        })),
      
      setPaymentPeriod: (period) => set({ paymentPeriod: period }),
      
  // Utilidades
  clearQuotation: () => set({ ...initialState }),
  clearCurrentForm: () => set((state) => ({ 
    cliente: null,
    filterData: null,
    searchData: null,
    clientSearchResult: null,
    clientData: { ...initialState.clientData }
  })),      loadExistingQuotation: (quotationRequest) => {
        const cliente = quotationRequest.cliente;
        
        if (cliente) {
          const filterData: FilterData = {
            tipoDocumento: "1",
            identificacion: cliente.identification
          };
          
          // Configurar clientData del stepper basado en el cliente cargado
          const clientData = {
            clientChoosen: cliente.clientChoosen || 0,
            identification: cliente.identification || '',
            name: cliente.name || '',
            contact: cliente.contact || '',
            email: cliente.email || '',
            address: cliente.address || '',
            office: cliente.office || '',
            agent: cliente.agent || '',
            agentId: cliente.agentId || 0,
            tipoPlan: cliente.tipoPlan || 0,
          };
          
          set({
            user: quotationRequest.user,
            cliente: quotationRequest.cliente,
            planes: quotationRequest.planes || [],
            filterData: filterData,
            clientData: clientData,
            // Asegurar que se mantenga el step actual o resetear a step1
            currentStep: 'step1'
          });
        } else {
          set({
            user: quotationRequest.user,
            cliente: quotationRequest.cliente,
            planes: quotationRequest.planes || [],
            clientData: { ...initialState.clientData }
          });
        }
      },
      
      getFinalObject: () => {
        const { cliente, planes } = get();
        
        let authenticatedUser = null;
        if (typeof window !== "undefined") {
          try {
            const authStorageData = localStorage.getItem("auth-storage");
            
            if (authStorageData) {
              const authData = JSON.parse(authStorageData);
              authenticatedUser = authData?.state?.user?.data?.user || null;
            }
          } catch (error) {
            console.error("Error getting authenticated user:", error);
          }
        }
        
        return { user: authenticatedUser, cliente, planes };
      },
      
      resetStepper: () => set({
        currentStep: 'step1',
        clientData: { ...initialState.clientData },
        selectedPlans: [],
        selectedOptionalCoverages: {},
        paymentPeriod: ''
      })
    }),
    {
      name: 'unified-quotation-v2',
      version: 2,
      // Solo persistir datos específicos para evitar problemas de serialización
      partialize: (state) => ({
        user: state.user,
        cliente: state.cliente,
        planes: state.planes,
        filterData: state.filterData,
        agentOptions: state.agentOptions ? [...state.agentOptions] : [],
      }),
      // Función merge personalizada para asegurar estados limpios
      merge: (persistedState: unknown, currentState) => {
        const typedPersistedState = persistedState as Partial<UnifiedQuotationState>;
        return {
          ...currentState,
          ...typedPersistedState,
          // Asegurar que los arrays siempre existan
          planes: Array.isArray(typedPersistedState?.planes) ? typedPersistedState.planes : [],
          agentOptions: Array.isArray(typedPersistedState?.agentOptions) ? typedPersistedState.agentOptions : [],
        };
      },
    }
  )
);

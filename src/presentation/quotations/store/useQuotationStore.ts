import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cliente, Plan, QuotationRequest } from '../interface/createQuotation.interface';

interface FilterData {
  tipoDocumento: string;
  identificacion: string;
}

interface QuotationState {
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
  filterData: FilterData | null;
  agentOptions: unknown[];
  setUser: (user: string) => void;
  setCliente: (cliente: Cliente) => void;
  setFilterData: (filterData: FilterData) => void;
  setAgentOptions: (agents: unknown[]) => void;
  addPlan: (plan: Plan) => void;
  updateLastPlan: (plan: Partial<Plan>) => void;
  updatePlanByName: (planName: string, update: Partial<Plan>) => void;
  removePlan: (planName: string) => void;
  clearQuotation: () => void;
  loadExistingQuotation: (quotationRequest: QuotationRequest) => void;
  getFinalObject: () => QuotationRequest;
  isComplete: () => boolean;
}

export const useQuotationStore = create<QuotationState>()(
  persist(
    (set, get) => ({
      user: null,
      cliente: null,
      planes: [],
      filterData: null,
      agentOptions: [],
      setUser: (user) => set({ user }),
      setCliente: (cliente) => set({ cliente }),
      setFilterData: (filterData) => set({ filterData }),
      setAgentOptions: (agentOptions) => set({ agentOptions }),
      addPlan: (plan) => set((state) => ({ planes: [...state.planes, plan] })),
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
      clearQuotation: () => set({ 
        user: null, 
        cliente: null, 
        planes: [], 
        filterData: null, 
        agentOptions: [] 
      }),
      loadExistingQuotation: (quotationRequest) => {
        const cliente = quotationRequest.cliente;
        
        if (cliente) {
          // Crear filterData solo con los campos del filtro real
          const filterData: FilterData = {
            tipoDocumento: "CEDULA", // Valor por defecto, se podría mejorar
            identificacion: cliente.identification
          };
          
          set({
            user: quotationRequest.user,
            cliente: quotationRequest.cliente,
            planes: quotationRequest.planes || [],
            filterData: filterData
          });
        } else {
          set({
            user: quotationRequest.user,
            cliente: quotationRequest.cliente,
            planes: quotationRequest.planes || []
          });
        }
      },
      getFinalObject: () => {
        const { user, cliente, planes } = get();
        return { user, cliente, planes };
      },
      isComplete: () => {
        const { cliente, planes } = get();
        return !!cliente && planes.length > 0;
      },
    }),
    {
      name: 'quotation-storage',
    }
  )
);

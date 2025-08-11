import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cliente, Plan, QuotationRequest } from '../interface/createQuotation.interface';

interface FilterData {
  tipoDocumento: "1" | "2" | "3"; // 1: Cédula, 2: RNC, 3: Pasaporte
  identificacion: string;
}

interface QuotationState {
  mode: "create" | number;
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
  filterData: FilterData | null;
  agentOptions: unknown[];
  setMode: (mode: "create" | number) => void;
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
      mode: "create",
      user: null,
      cliente: null,
      planes: [],
      filterData: null,
      agentOptions: [],
      setMode: (mode) => set({ mode }),
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
        mode: "create",
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
            tipoDocumento: "1", // Valor por defecto, se podría mejorar
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
        const { cliente, planes } = get();
        
        // Obtener el usuario autenticado desde localStorage de manera segura
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
      isComplete: () => {
        const { cliente, planes } = get();
        return !!cliente && planes.length > 0;
      },
    }),
    {
      name: 'quotation-storage',
       partialize: (state) => ({
        // Guardar solo lo necesario, excluyendo "mode"
        user: state.user,
        cliente: state.cliente,
        planes: state.planes,
        filterData: state.filterData,
        agentOptions: state.agentOptions,
      }),
    }
  )
);

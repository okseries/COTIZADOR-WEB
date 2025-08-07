import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cliente, Plan } from '../interface/createQuotation.interface';

interface QuotationState {
  user: string | null;
  cliente: Cliente | null;
  planes: Plan[];
  setUser: (user: string) => void;
  setCliente: (cliente: Cliente) => void;
  addPlan: (plan: Plan) => void;
  updateLastPlan: (plan: Partial<Plan>) => void;
  updatePlanByName: (planName: string, update: Partial<Plan>) => void;
  removePlan: (planName: string) => void;
  clearQuotation: () => void;
  getFinalObject: () => any;
  isComplete: () => boolean;
}

export const useQuotationStore = create<QuotationState>()(
  persist(
    (set, get) => ({
      user: null,
      cliente: null,
      planes: [],
      setUser: (user) => set({ user }),
      setCliente: (cliente) => set({ cliente }),
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
      clearQuotation: () => set({ user: null, cliente: null, planes: [] }),
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

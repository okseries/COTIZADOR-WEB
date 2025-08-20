import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {  PlanFormValues, QuotationFormValues } from '../schema/quotatio-schema';
import { ClienteFormValues } from '@/presentation/client/schema/ClientInfo.schema';

interface StepperState {
  // Estado actual del stepper
  currentStep: string;
  
  // Datos del formulario por pasos
  clientData: Partial<ClienteFormValues>;
  selectedPlans: PlanFormValues[];
  selectedOptionalCoverages: { [planId: string]: number[] }; // planId -> array de IDs de opcionales
  paymentPeriod: string;
  
  // Estado de validación
  isStepValid: (step: string) => boolean;
  
  // Acciones
  setCurrentStep: (step: string) => void;
  setClientData: (data: Partial<ClienteFormValues>) => void;
  addPlan: (plan: PlanFormValues) => void;
  removePlan: (planId: string) => void;
  updatePlan: (planId: string, plan: PlanFormValues) => void;
  setOptionalCoverages: (planId: string, coverageIds: number[]) => void;
  setPaymentPeriod: (period: string) => void;
  
  // Generar objeto final para enviar
  generateQuotationObject: () => QuotationFormValues | null;
  
  // Reset
  resetStepper: () => void;
}

const useStepperStore = create<StepperState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentStep: 'step1',
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
      paymentPeriod: 'Mensual',
      
      // Validación de pasos
      isStepValid: (step: string) => {
        const state = get();
        
        switch (step) {
          case 'step1':
            return !!(
              state.clientData.clientChoosen &&
              state.clientData.identification &&
              state.clientData.name &&
              state.clientData.contact &&
              state.clientData.email &&
              state.clientData.address &&
              state.clientData.office &&
              state.clientData.agent &&
              state.clientData.tipoPlan
            );
          
          case 'step2':
            return state.selectedPlans.length > 0;
          
          case 'step3':
            return true; // Los opcionales son opcionales
          
          case 'step4':
            return !!state.paymentPeriod;
          
          default:
            return false;
        }
      },
      
      // Acciones
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setClientData: (data) => 
        set((state) => ({
          clientData: { ...state.clientData, ...data }
        })),
      
      addPlan: (plan) =>
        set((state) => ({
          selectedPlans: [...state.selectedPlans, plan]
        })),
      
      removePlan: (planId) =>
        set((state) => {
          const newOptionalCoverages = { ...state.selectedOptionalCoverages };
          delete newOptionalCoverages[planId];
          
          return {
            selectedPlans: state.selectedPlans.filter(p => p.plan !== planId),
            selectedOptionalCoverages: newOptionalCoverages
          };
        }),
      
      updatePlan: (planId, plan) =>
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
      
      // Generar objeto final
      generateQuotationObject: () => {
        const state = get();
        
        if (!state.isStepValid('step1') || !state.isStepValid('step2')) {
          return null;
        }
        
        try {
          const quotationObject: QuotationFormValues = {
            user: "juan.ditren", // TODO: obtener del contexto de auth
            cliente: state.clientData as ClienteFormValues,
            planes: state.selectedPlans.map(plan => ({
              ...plan,
              opcionales: state.selectedOptionalCoverages[plan.plan]?.map(id => {
                // Aquí necesitarías mapear los IDs a los objetos completos
                // Por ahora retornamos un objeto básico
                return {
                  nombre: `Opcional ${id}`,
                  descripcion: null,
                  prima: 0
                };
              }) || [],
              resumenPago: {
                ...plan.resumenPago,
                periodoPago: state.paymentPeriod
              }
            }))
          };
          
          return quotationObject;
        } catch (error) {
          console.error("Error generating quotation object:", error);
          return null;
        }
      },
      
      // Reset
      resetStepper: () => set({
        currentStep: 'step1',
        clientData: {},
        selectedPlans: [],
        selectedOptionalCoverages: {},
        paymentPeriod: 'Mensual'
      })
    }),
    {
      name: 'stepper-store'
    }
  )
);

export default useStepperStore;

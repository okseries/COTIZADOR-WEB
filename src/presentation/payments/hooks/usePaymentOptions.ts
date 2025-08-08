
import { useState, useEffect, useCallback } from 'react';
import { useQuotationStore } from '../../quotations/store/useQuotationStore';
import { useAuth } from '../../auth/store/useAuth.store';
import { paymentService } from '../services/payment.service';
import { Plan } from '../../quotations/interface/createQuotation.interface';
import { useQueryClient } from '@tanstack/react-query';

export type PeriodoPago = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';

interface PaymentPlan extends Plan {
  selectedPeriod?: PeriodoPago;
}

interface PaymentSummary {
  subTotalAfiliado: number;
  subTotalOpcional: number;
  totalPagar: number;
}

export const MULTIPLICADORES: Record<PeriodoPago, number> = {
  Mensual: 1,
  Trimestral: 3,
  Semestral: 6,
  Anual: 12,
};

export const usePaymentOptions = () => {
  const { user: authUser } = useAuth();
  const { cliente, planes, updatePlanByName, clearQuotation } = useQuotationStore();
  const queryClient = useQueryClient();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar planes con período por defecto
  useEffect(() => {
    if (planes.length > 0) {
      const initializedPlans = planes.map(plan => ({
        ...plan,
        selectedPeriod: plan.resumenPago?.periodoPago as PeriodoPago || 'Mensual'
      }));
      
      // Solo actualizar si los planes han cambiado
      setPaymentPlans(prev => {
        if (prev.length !== initializedPlans.length || 
            prev.some((p, i) => p.plan !== initializedPlans[i].plan)) {
          return initializedPlans;
        }
        return prev;
      });
    } else {
      setPaymentPlans([]);
    }
  }, [planes]);

  // Calcular resumen de pago para un plan
  const calculatePaymentSummary = (plan: Plan, periodo: PeriodoPago): PaymentSummary => {
    const subTotalAfiliado = plan.afiliados.reduce((sum, afiliado) => 
      sum + parseFloat(afiliado.subtotal.toString()), 0
    );
    
    const subTotalOpcional = plan.opcionales.reduce((sum, opcional) => 
      sum + opcional.prima, 0
    );
    
    const baseTotal = subTotalAfiliado + subTotalOpcional;
    const totalPagar = baseTotal * MULTIPLICADORES[periodo];

    return {
      subTotalAfiliado,
      subTotalOpcional,
      totalPagar
    };
  };

  // Manejar cambio de período de pago
  const handlePeriodChange = useCallback((planName: string, periodo: PeriodoPago) => {
    setPaymentPlans(prev => 
      prev.map(plan => {
        if (plan.plan === planName) {
          const summary = calculatePaymentSummary(plan, periodo);
          const updatedPlan = {
            ...plan,
            selectedPeriod: periodo,
            resumenPago: {
              ...plan.resumenPago,
              periodoPago: periodo,
              ...summary
            }
          };

          // Actualizar en el store de forma asíncrona para evitar el error de renderizado
          setTimeout(() => {
            updatePlanByName(planName, {
              resumenPago: updatedPlan.resumenPago
            });
          }, 0);

          return updatedPlan;
        }
        return plan;
      })
    );
  }, [updatePlanByName]);

  // Validar si todos los planes tienen período seleccionado
  const isFormValid = useCallback(() => {
    return paymentPlans.length > 0 && 
           paymentPlans.every(plan => plan.selectedPeriod);
  }, [paymentPlans]);

  // Calcular total general
  const getTotalGeneral = () => {
    return paymentPlans.reduce((total, plan) => 
      total + (plan.resumenPago?.totalPagar || 0), 0
    );
  };

  // Función para descargar PDF
  const downloadPDF = useCallback((base64: string, filename: string) => {
    try {
      // Convertir base64 a blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear URL del blob
      const blobUrl = URL.createObjectURL(blob);

      // Abrir en nueva ventana
      window.open(blobUrl, '_blank');

      // Descargar automáticamente
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'cotizacion.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      setError('Error al descargar el PDF');
    }
  }, []);

  // Enviar cotización final
  const submitQuotation = useCallback(async () => {
    const userName = authUser?.data?.user;
    
    console.log("=== DEBUG SUBMIT QUOTATION ===");
    console.log("authUser completo:", authUser);
    console.log("authUser?.data:", authUser?.data);
    console.log("userName extraído:", userName);
    console.log("isFormValid():", isFormValid());
    console.log("cliente:", cliente);
    console.log("Validación userName:", !!userName);
    console.log("Validación cliente:", !!cliente);
    console.log("=== END DEBUG SUBMIT ===");
    
    if (!isFormValid() || !userName || !cliente) {
      setError('Faltan datos requeridos para completar la cotización');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalPayload = {
        user: userName,
        cliente,
        planes: paymentPlans.map(plan => ({
          plan: plan.plan,
          afiliados: plan.afiliados,
          opcionales: plan.opcionales,
          resumenPago: plan.resumenPago,
          cantidadAfiliados: plan.cantidadAfiliados,
          tipo: plan.tipo
        }))
      };

      const response = await paymentService.calculateQuotation(finalPayload);
      
      // Descargar PDF
      downloadPDF(response.pdfBase64, response.filename);
      
      // Resetear el store después del éxito
      clearQuotation();
      
      // Invalidar cache de cotizaciones para que se actualice la tabla
      queryClient.invalidateQueries({
        queryKey: ['quotations', userName]
      });
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la cotización');
    } finally {
      setIsSubmitting(false);
    }
  }, [authUser, cliente, paymentPlans, downloadPDF, clearQuotation, queryClient, isFormValid]);

  return {
    paymentPlans,
    isSubmitting,
    error,
    isFormValid: isFormValid(),
    totalGeneral: getTotalGeneral(),
    handlePeriodChange,
    submitQuotation,
    MULTIPLICADORES
  };
};

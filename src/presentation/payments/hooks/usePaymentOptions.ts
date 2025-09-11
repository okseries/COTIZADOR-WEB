import { useState, useEffect, useCallback, useMemo } from "react";
import { useUnifiedQuotationStore } from "@/core";
import { useAuth } from "../../auth/store/useAuth.store";
import { paymentService } from "../services/payment.service";
import { Plan } from "../../quotations/interface/createQuotation.interface";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { saveAs } from "file-saver";

export type PeriodoPago = "Mensual" | "Trimestral" | "Semestral" | "Anual" | "seleccionar";

interface PaymentPlan extends Plan {
  selectedPeriod?: PeriodoPago;
}

interface PaymentSummary {
  subTotalAfiliado: number;
  subTotalOpcional: number;
  totalPagar: number;
}

export const MULTIPLICADORES: Record<PeriodoPago, number> = {
  seleccionar: 0,
  Mensual: 1,
  Trimestral: 3,
  Semestral: 6,
  Anual: 12,
};

export const usePaymentOptions = () => {
  const { user: authUser } = useAuth();
  const { cliente, planes, updatePlanByName, clearQuotation, mode } =
    useUnifiedQuotationStore();
  const queryClient = useQueryClient();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar planes con período por defecto
  useEffect(() => {
    if (planes.length > 0) {
      const initializedPlans = planes.map((plan) => ({
        ...plan,
        // En modo crear: siempre comenzar sin período seleccionado
        // En modo editar: usar el período que ya tiene la cotización
        selectedPeriod: mode === "create" 
          ? undefined 
          : (plan.resumenPago?.periodoPago as PeriodoPago) || undefined,
      }));

      // Solo actualizar si los planes han cambiado
      setPaymentPlans((prev) => {
        if (
          prev.length !== initializedPlans.length ||
          prev.some((p, i) => p.plan !== initializedPlans[i].plan)
        ) {
          return initializedPlans;
        }
        return prev;
      });
    } else {
      setPaymentPlans([]);
    }
  }, [planes, mode]); // Agregar mode como dependencia

  // 🆕 EFECTO PARA NAVEGACIÓN ENTRE STEPS: Detectar y restaurar períodos de pago seleccionados
  useEffect(() => {
    // 🔧 FIX MODO CREAR: Detectar navegación de vuelta al Step 4
    const isReturningToStep4 = planes.length > 0 && 
                               paymentPlans.length > 0 && 
                               mode === "create" &&
                               paymentPlans.every(plan => !plan.selectedPeriod);
    
    if (isReturningToStep4) {
      // Verificar si hay períodos guardados en el store
      const hasPeriodInStore = planes.some(plan => {
        const period = plan.resumenPago?.periodoPago;
        return period && 
               period !== "" && 
               period !== "seleccionar" && 
               Object.keys(MULTIPLICADORES).includes(period);
      });
      
      if (hasPeriodInStore) {
        
        // Restaurar períodos desde el store
        setPaymentPlans(prev => prev.map(plan => {
          const storePlan = planes.find(p => p.plan === plan.plan);
          const storedPeriod = storePlan?.resumenPago?.periodoPago;
          
          if (storedPeriod && storedPeriod !== "" && storedPeriod !== "seleccionar") {
            const typedPeriod = storedPeriod as PeriodoPago;
            return {
              ...plan,
              selectedPeriod: typedPeriod,
              resumenPago: storePlan?.resumenPago || plan.resumenPago
            };
          }
          
          return plan;
        }));
        
      }
    }
  }, [planes.length, paymentPlans.length, mode]);

  // Calcular resumen de pago para un plan
  const calculatePaymentSummary = (
    plan: Plan,
    periodo: PeriodoPago
  ): PaymentSummary => {
    const subTotalAfiliado = plan.afiliados.reduce(
      (sum, afiliado) => sum + parseFloat(afiliado.subtotal.toString()),
      0
    );

    const subTotalOpcional = plan.opcionales.reduce(
      (sum, opcional) => sum + opcional.prima,
      0
    );

    const baseTotal = subTotalAfiliado + subTotalOpcional;
    const totalPagar = baseTotal * MULTIPLICADORES[periodo];

    return {
      subTotalAfiliado,
      subTotalOpcional,
      totalPagar,
    };
  };

  // Manejar cambio de período de pago
  const handlePeriodChange = useCallback(
    (_planName: string, periodo: PeriodoPago | undefined) => {
      setPaymentPlans((prev) =>
        prev.map((plan) => {
          // 🆕 SINCRONIZACIÓN: Aplicar el cambio a TODOS los planes, no solo al seleccionado
          if (!periodo) {
            // Si no hay período seleccionado, limpiar el resumen de pago para todos
            const updatedPlan = {
              ...plan,
              selectedPeriod: undefined,
              resumenPago: {
                ...plan.resumenPago,
                periodoPago: "",
                subTotalAfiliado: 0,
                subTotalOpcional: 0,
                totalPagar: 0,
              },
            };

            setTimeout(() => {
              updatePlanByName(plan.plan, {
                resumenPago: updatedPlan.resumenPago,
              });
            }, 0);

            return updatedPlan;
          }

          // Aplicar el período seleccionado a todos los planes
          const summary = calculatePaymentSummary(plan, periodo);
          
          const updatedPlan = {
            ...plan,
            selectedPeriod: periodo,
            resumenPago: {
              ...plan.resumenPago,
              periodoPago: periodo,
              ...summary,
            },
          };

          // Actualizar en el store de forma asíncrona para evitar el error de renderizado
          setTimeout(() => {
            updatePlanByName(plan.plan, {
              resumenPago: updatedPlan.resumenPago,
            });
          }, 0);

          return updatedPlan;
        })
      );
    },
    [updatePlanByName]
  );

  // Validar si todos los planes tienen período seleccionado
  const isFormValid = useCallback(() => {
    return (
      paymentPlans.length > 0 &&
      paymentPlans.every((plan) => plan.selectedPeriod)
    );
  }, [paymentPlans]);

  // Calcular total general con useMemo para mejor rendimiento y sincronización
  const totalGeneral = useMemo(() => {
    if (paymentPlans.length === 0) {
      return 0;
    }

    const total = paymentPlans.reduce((total, plan) => {
      // Si no hay período seleccionado, no sumar nada
      if (!plan.selectedPeriod || plan.selectedPeriod === "seleccionar") {
        return total;
      }

      // Calcular el total correctamente con el período seleccionado
      const subTotalAfiliado = plan.afiliados.reduce(
        (sum, afiliado) => sum + parseFloat(afiliado.subtotal.toString()),
        0
      );

      const subTotalOpcional = plan.opcionales.reduce(
        (sum, opcional) => sum + opcional.prima,
        0
      );

      const baseTotal = subTotalAfiliado + subTotalOpcional;
      const multiplier = MULTIPLICADORES[plan.selectedPeriod];
      const totalPlanConPeriodo = baseTotal * multiplier;

      return total + totalPlanConPeriodo;
    }, 0);

    return total;
  }, [paymentPlans]); // Recalcular cuando cambien los paymentPlans

  // Función para descargar PDF
  //! Modificado para funcionar mejor en móviles
  const downloadPDF = useCallback((base64: string, filename?: string) => {
    try {
      // Convertir base64 → bytes
      const byteCharacters = atob(base64);
      const byteArray = Uint8Array.from(byteCharacters, c => c.charCodeAt(0));

      // Crear blob de PDF
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // Nombre por defecto
      const fechaHora = format(new Date(), "dd-MMMM-yyyy_hh-mm-a", { locale: es });
      const finalName = filename || `cotizacion-${fechaHora}.pdf`;

      // Intentar abrir en nueva ventana (móviles suelen preferir esto)
      const url = URL.createObjectURL(blob);
      // const newWindow = window.open(url, "_blank");

      
        saveAs(blob, finalName);

      // Revocar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 10000);

    } catch (err) {
      console.error("Error al descargar PDF:", err);
      // si usas un state para errores, setError("Error al descargar el PDF")
    }
  }, []);

  // Enviar cotización final
  //! Esto envia la cotizacion final al backend
  const submitQuotation = useCallback(async () => {
    const userName = authUser?.data?.user;

    if (!isFormValid() || !userName || !cliente) {
      setError("Faltan datos requeridos para completar la cotización");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalPayload = {
        user: userName,
        cliente,
        planes: paymentPlans.map((plan) => ({
          plan: plan.plan,
          afiliados: plan.afiliados,
          opcionales: plan.opcionales, // ✅ Ya incluye originalOptId desde useCoberturasOpcionales
          resumenPago: plan.resumenPago,
          cantidadAfiliados: plan.cantidadAfiliados,
          tipo: plan.tipo,
        })),
      };

      //! mode puede ser el id de la cotización existente o "create" para una nueva
      const response =
        mode === "create"
          ? await paymentService.generateQuotation(finalPayload)
          : await paymentService.updateQuotation(mode, finalPayload);

      // Log para depuración de la respuesta
      // console.log("Respuesta de cotización:", response);

      // Descargar PDF
      downloadPDF(response.pdfBase64, response.filename);

      // Resetear el store después del éxito
      clearQuotation();

      // Invalidar cache de cotizaciones para que se actualice la tabla
      queryClient.invalidateQueries({
        queryKey: ["quotations", userName],
      });

      // Redirigir al dashboard después de un breve delay
      // setTimeout(() => {
      //   window.location.href = "/dashboard";
      // }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar la cotización"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    authUser,
    cliente,
    paymentPlans,
    downloadPDF,
    clearQuotation,
    queryClient,
    isFormValid,
  ]);

  return {
    paymentPlans,
    isSubmitting,
    error,
    isFormValid: isFormValid(),
    totalGeneral,
    handlePeriodChange,
    submitQuotation,
    MULTIPLICADORES,
  };
};

"use client";
import { useCallback } from "react";
import { useUnifiedQuotationStore } from "@/core";
import { useClientSearch } from "@/presentation/client/hooks/useClientSearch";

export const useClearActions = () => {
  const { clearQuotation } = useUnifiedQuotationStore();
  const { setClientData, setSearchData } = useClientSearch();

  // Limpiar todo el store y datos relacionados
  const clearAll = useCallback(() => {
    clearQuotation();
    setClientData(null);
    setSearchData({
      tipoDocumento: "1",
      identificacion: "",
    });
  }, [clearQuotation, setClientData, setSearchData]);

  // Limpiar solo el step actual (se puede customizar por step)
  const clearCurrentStep = useCallback((stepType?: "client" | "plans" | "coverage" | "payment") => {
    switch (stepType) {
      case "client":
        setClientData(null);
        setSearchData({
          tipoDocumento: "1",
          identificacion: "",
        });
        break;
      case "plans":
        // Limpiar solo planes seleccionados
        // Aquí se podría agregar lógica específica para planes
        break;
      case "coverage":
        // Limpiar solo coberturas opcionales
        break;
      case "payment":
        // Limpiar solo información de pago
        break;
      default:
        // Limpiar step genérico
        break;
    }
  }, [setClientData, setSearchData]);

  return {
    clearAll,
    clearCurrentStep,
  };
};

export default useClearActions;

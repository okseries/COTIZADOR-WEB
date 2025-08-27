import { useUnifiedQuotationStore } from "@/core";
import { FiltrarClientFormValues } from '../schema/filtrar-client.schema';

interface ClientData {
  NOMBRE_COMPLETO: string;
}

interface ClientSearchContextType {
  searchData: FiltrarClientFormValues | null;
  setSearchData: (data: FiltrarClientFormValues) => void;
  clearSearchData: () => void;
  clientData: ClientData | null;
  setClientData: (data: ClientData | null) => void;
}

/**
 * Hook adaptador que usa el store unificado pero mantiene la misma interfaz
 * que el contexto ClientSearch para backward compatibility
 */
export const useClientSearchAdapter = (): ClientSearchContextType => {
  const { 
    searchData, 
    clientSearchResult, 
    setSearchData: setStoreSearchData,
    setClientSearchResult,
    clearClientSearch
  } = useUnifiedQuotationStore();

  // Adaptar los datos del store al formato esperado por los componentes
  const adaptedSearchData: FiltrarClientFormValues | null = searchData ? {
    tipoDocumento: searchData.tipoDocumento as "1" | "2" | "3",
    identificacion: searchData.identificacion
  } : null;

  const setSearchData = (data: FiltrarClientFormValues) => {
    setStoreSearchData({
      tipoDocumento: data.tipoDocumento,
      identificacion: data.identificacion
    });
  };

  const clearSearchData = () => {
    clearClientSearch();
  };

  const setClientData = (data: ClientData | null) => {
    setClientSearchResult(data);
  };

  return {
    searchData: adaptedSearchData,
    setSearchData,
    clearSearchData,
    clientData: clientSearchResult,
    setClientData
  };
};

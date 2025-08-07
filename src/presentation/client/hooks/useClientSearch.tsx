import { createContext, useContext, useState, ReactNode } from 'react';
import { FiltrarClientFormValues } from '../schema/filtrar-client.schema';

interface ClientSearchContextType {
  searchData: FiltrarClientFormValues | null;
  setSearchData: (data: FiltrarClientFormValues) => void;
  clearSearchData: () => void;
}

const ClientSearchContext = createContext<ClientSearchContextType | undefined>(undefined);

export const ClientSearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchData, setSearchData] = useState<FiltrarClientFormValues | null>(null);

  const clearSearchData = () => {
    setSearchData(null);
  };

  return (
    <ClientSearchContext.Provider value={{ searchData, setSearchData, clearSearchData }}>
      {children}
    </ClientSearchContext.Provider>
  );
};

export const useClientSearch = () => {
  const context = useContext(ClientSearchContext);
  if (context === undefined) {
    throw new Error('useClientSearch must be used within a ClientSearchProvider');
  }
  return context;
};

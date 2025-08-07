import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/store/useAuth.store';
import { quotationService } from '../services/quotation.service';

const QUOTATIONS_QUERY_KEY = 'quotations';

export const useQuotations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userName = user?.data?.user;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, userName],
    queryFn: () => quotationService.getQuotationsByUser(userName!),
    enabled: !!userName,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Función para invalidar la cache y refrescar los datos
  const invalidateQuotations = () => {
    queryClient.invalidateQueries({
      queryKey: [QUOTATIONS_QUERY_KEY, userName]
    });
  };

  // Función para refrescar manualmente
  const refreshQuotations = () => {
    refetch();
  };

  return {
    quotations: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error: error ? (error as Error).message : null,
    invalidateQuotations,
    refreshQuotations
  };
};

// Hook para obtener una cotización específica
export const useQuotationById = (id: string) => {
  const {
    data: quotation,
    isLoading,
    error
  } = useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, 'detail', id],
    queryFn: () => quotationService.getQuotationById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    quotation,
    isLoading,
    error: error ? (error as Error).message : null
  };
};

import { useQuery } from "@tanstack/react-query";
import { ClientByIdentification } from "../services/client.services";



export const useGetClient = (identification: string, identificationType: string) => {
  return useQuery({
    queryKey: ["client", identification, identificationType],
    queryFn: () => ClientByIdentification(identification, +identificationType),
    staleTime: 3000 * 60 * 60, // 3 horas
  });
};
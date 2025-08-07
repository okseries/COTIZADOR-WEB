import { useQuery } from "@tanstack/react-query";
import { GetPrimaPlan } from "../service/prima.service";

export const usePrimaPlan = (
  planName: string, 
  edad: number, 
  tipoPlan: number, 
  clientChoosen: number, 
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["prima", planName, edad, tipoPlan, clientChoosen],
    queryFn: () => GetPrimaPlan(planName, edad, tipoPlan, clientChoosen),
    enabled: enabled && planName !== '' && edad > 0 && tipoPlan > 0 && clientChoosen > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

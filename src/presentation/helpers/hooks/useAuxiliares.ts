import { useQuery } from "@tanstack/react-query";
import { GetIntermediarios, GetPromotores, GetSucursales } from "../auxs.service";



export const useIntermediarios = () => {
  return useQuery({
    queryKey: ["intermediarios"],
    queryFn: GetIntermediarios,
    staleTime: 2000 * 60 * 60, // 2 horas
  });
};


export const useSucursales = () => {
  return useQuery({
    queryKey: ["sucursales"],
    queryFn: GetSucursales,
    staleTime: 2000 * 60 * 60, // 2 horas
  });
}


export const usePromotores = () => {
  return useQuery({
    queryKey: ["promotores"],
    queryFn: GetPromotores,
    staleTime: 2000 * 60 * 60, // 2 horas
  });
}

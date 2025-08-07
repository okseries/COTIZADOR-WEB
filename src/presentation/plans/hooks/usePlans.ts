import { useQuery } from "@tanstack/react-query";
import { GetAllPlans, GetPlansType, GetSubPlansType } from "../service/plan.service";

export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: GetPlansType,
    staleTime: 2000 * 60 * 60, // 2 horas
  });
};



export const useSubPlansType = () => {
  return useQuery({
    queryKey: ["subplans"],
    queryFn: GetSubPlansType,
    staleTime: 2000 * 60 * 60, // 2 horas
  });
};

export const useGetAllPlans = (polizaType: number, planType: number) => {
  return useQuery({
    queryKey: ["allplans", polizaType, planType],
    queryFn: () => GetAllPlans(polizaType, planType),
    staleTime: 2000 * 60 * 60, // 2 horas
  });
};
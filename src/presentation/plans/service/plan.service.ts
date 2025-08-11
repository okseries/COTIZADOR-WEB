import apiClient from "../../../../core/apiclient";
import { Plan, PlansType, SubPlansType } from "../interface/plan.interface";



export const GetPlansType = async () => {
    try {

        const {data} = await apiClient.get<PlansType[]>("/planes/types");

        return data; // Retorna los tipos de planes obtenidos del servidor
        
    } catch (error) {
        console.error("Error al obtener los planes:", error);
        throw new Error("No se pudieron obtener los planes");
    }
}



export const GetSubPlansType = async () => {
    try {
        const { data } = await apiClient.get<SubPlansType[]>(`/cotizantes`);
        return data; // Retorna los subtipos de planes obtenidos del servidor
    } catch (error) {
        console.error("Error al obtener los subtipos de planes:", error);
        throw new Error("No se pudieron obtener los subtipos de planes");
    }
}


export const GetAllPlans = async (polizaType: number, planType: number) => {
  try {
    const { data } = await apiClient.get<Plan[]>(
      `/planes/${planType}/${polizaType}`
    );
    return data;
  } catch {
    return [];
  }
};
import apiClient from "../../../../core/apiclient";
import { CoberturasOpcional } from "../interface/Coberturaopcional.interface";

export const GetCoberturasOpcionales = async (
  planName: string,
  idTipoPlan: number,
  idCotizante: number
) => {
  try {
    const url = `/opcionales-planes/${encodeURIComponent(planName)}/${idTipoPlan}/${idCotizante}`;
    
    const { data } = await apiClient.get<CoberturasOpcional[]>(url);
    return data;
  } catch (error) {
    console.error("❌ Error al obtener coberturas opcionales:", error);
    console.error("📋 Failed parameters:", { planName, idTipoPlan, idCotizante });
    throw error;
  }
};

import apiClient from "../../../../core/apiclient";
import { CoberturasOpcional } from "../interface/Coberturaopcional.interface";

export const GetCoberturasOpcionales = async (
  planName: string,
  idTipoPlan: number,
  idCotizante: number
) => {
  try {

    console.log("*************************************");
    console.log({
      planName,
      idTipoPlan,
      idCotizante
    });
    console.log("*************************************");

    
    const url = `/opcionales-planes/${planName}/${idCotizante}/${idTipoPlan}`;
    
    const { data } = await apiClient.get<CoberturasOpcional[]>(url);
    return data;
  } catch (error) {
    console.error("❌ Error al obtener coberturas opcionales:", error);
    console.error("📋 Failed parameters:", { planName, idTipoPlan, idCotizante });
    throw error;
  }
};

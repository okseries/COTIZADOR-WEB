import apiClient from "../../../../core/apiclient";
import { CoberturasOpcional } from "../interface/Coberturaopcional.interface";

export const GetCoberturasOpcionales = async (
  planName: string,
  idTipoPlan: number,
  idCotizante: number
) => {
  try {
    const { data } = await apiClient.get<CoberturasOpcional[]>(
      `/opcionales-planes${planName}/${idTipoPlan}/${idCotizante}`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener coberturas opcionales:", error);
    throw error;
  }
};

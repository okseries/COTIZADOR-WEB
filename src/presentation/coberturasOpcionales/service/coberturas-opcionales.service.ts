import apiClient from "../../../../core/apiclient";
import {
  CoberturasOpcional,
  CoberturasOpcionaleColectivo,
  Copago,
} from "../interface/Coberturaopcional.interface";

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
      idCotizante,
    });
    console.log("*************************************");

    const url = `/opcionales-planes/${planName}/${idCotizante}/${idTipoPlan}`;

    const { data } = await apiClient.get<CoberturasOpcional[]>(url);
    return data;
  } catch (error) {
    console.error("❌ Error al obtener coberturas opcionales:", error);
    console.error("📋 Failed parameters:", {
      planName,
      idTipoPlan,
      idCotizante,
    });
    throw error;
  }
};


//!  Este endponit se usara  para llenar los select cuando se selecciona un plan colectivo
export const getCoberturasOpcionales_colectivo = async (
  idOptionalType: number, //  id de la cobertura opcional
  idPlantype: number // clienteChousen 2  para colectivo
) => {
  const { data } = await apiClient.get<CoberturasOpcionaleColectivo[]>(
    `/opcionales-planes/${idOptionalType}/${idPlantype}`
  );

  return data;
};

export const getCopagos = async (
  idOptionalType: number = 1, // id de la cobertura opcional, solo medicamentos tiene copagos  y medicamento tiene el id 1
  idPlantype: number // clienteChousen 2 para colectivo
) => {
  const { data } = await apiClient.get<Copago[]>(
    `opcionales-planes/copagos/${idOptionalType}/${idPlantype}`
  );  
  return data;
};

import apiClient from "../../../core/apiclient";

export interface PrimaPlanResponse {
  id: number;
  uuid: string;
  planName: string;
  baseAmount: string;
  idTipoPlan: number;
  idTipoCotizante: number;
  minAge: number;
  maxAge: number;
}

export const GetPrimaPlan = async (
  planName: string, 
  edad: number, 
  tipoPlan: number, 
  clientChoosen: number
): Promise<number> => {
  try {
    // console.log({
    //   message: "Obteniendo prima del plan",
    //   planName,
    //   edad,
    //   tipoPlan,
    //   clientChoosen
    // });

    // alert(`Obteniendo prima del plan: ${planName}, Edad: ${edad}, Tipo de Plan: ${tipoPlan}, Cliente Elegido: ${clientChoosen}`);
    
    // Endpoint: /planes/{plan_name}/{edad}/{tipoPlan}/{clientChoosen}
    const { data } = await apiClient.get<PrimaPlanResponse[]>(
      `/planes/${encodeURIComponent(planName)}/${edad}/${tipoPlan}/${clientChoosen}`
    );
    
    // El API devuelve un array, tomamos el primer elemento y su baseAmount
    if (data && data.length > 0) {
      return parseFloat(data[0].baseAmount);
    }
    
    // Si no hay datos, devolver valor por defecto
    return 0;
  } catch (error: unknown) {
    console.error("Error al obtener la prima del plan:", error);
    
    // Si es un error 404 y contiene el mensaje sobre edad no encontrada, lanzar error específico
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 404 && axiosError.response?.data?.message?.includes('No se encontraron planes para la edad')) {
        throw new Error(`No se encontraron planes para la edad ${edad}. Por favor, ingrese una edad válida.`);
      }
    }
    
    // Para otros errores, usar valor por defecto
    return 1186.57;
  }
};

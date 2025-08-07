import { useQuery } from "@tanstack/react-query"
import { GetCoberturasOpcionales } from "../service/coberturas-opcionales.service";



export const usePlanesOpcionales = (planName: string, idTipoPlan: number, idCotizante: number) => {
    return useQuery({
        queryKey: ["planesOpcionales", planName, idTipoPlan, idCotizante],
        queryFn: async () => {
            const response = await GetCoberturasOpcionales(planName, idTipoPlan, idCotizante);
            return response;
        }
    });
}


import { useQuery } from "@tanstack/react-query"
import { GetCoberturasOpcionales } from "../service/coberturas-opcionales.service";



export const usePlanesOpcionales = (planName: string, idTipoPlan: number, idCotizante: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["planesOpcionales", planName, idTipoPlan, idCotizante],
        queryFn: async () => {
            if (!planName) {
                throw new Error("Plan name is required");
            }
            const response = await GetCoberturasOpcionales(planName, idTipoPlan, idCotizante);
            return response;
        },
        enabled: enabled && !!planName
    });
}


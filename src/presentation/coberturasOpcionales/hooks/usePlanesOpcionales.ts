import { useQuery } from "@tanstack/react-query"
import { GetCoberturasOpcionales, getCoberturasOpcionales_colectivo } from "../service/coberturas-opcionales.service";



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



export const useCoberturasOpcionales_colectivo = (idOptionalType: number, idPlantype: number) => {
    return useQuery({
        queryKey: ["coberturasOpcionalesColectivo", idOptionalType, idPlantype],
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCoberturasOpcionales_colectivo(idOptionalType, idPlantype);
            return response;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        
        enabled: !!idOptionalType && !!idPlantype
    });
}



import { useQuery } from "@tanstack/react-query"
import { GetCoberturasOpcionales, getCoberturasOpcionales_colectivo, getCopagos } from "../service/coberturas-opcionales.service";



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


// Hook para obtener coberturas opcionales de tipo colectivo
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


export const useCopagos = (idOptionalType: number = 1, idPlantype: number) => {
    return useQuery({
        queryKey: ["copagos", idOptionalType, idPlantype],  
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCopagos(idOptionalType, idPlantype);
            return response;
        }
        ,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!idOptionalType && !!idPlantype
    });
}

// Hook para obtener opciones dinámicas por tipo de cobertura
export const useCoberturasOpcionalesByType = (coberturaType: string, idPlantype: number, enabled: boolean = true) => {
    // Mapear tipos de cobertura a sus IDs
    const getOptionalTypeId = (type: string): number | null => {
        switch (type) {
            case 'altoCosto': return 3; // ID para Alto Costo
            case 'medicamentos': return 1; // ID para Medicamentos  
            case 'habitacion': return 2; // ID para Habitación
            case 'odontologia': return 4; // ID para Odontología - ⚠️ CONFIRMAR CON API
            default: return null;
        }
    };

    const idOptionalType = getOptionalTypeId(coberturaType);

    return useQuery({
        queryKey: ["coberturasOpcionalesByType", coberturaType, idOptionalType, idPlantype],
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCoberturasOpcionales_colectivo(idOptionalType, idPlantype);
            return response;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: enabled && !!idOptionalType && !!idPlantype
    });
}



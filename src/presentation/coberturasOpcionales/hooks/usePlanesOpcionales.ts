import { useQuery } from "@tanstack/react-query"
import { GetCoberturasOpcionales, getCoberturasOpcionales_colectivo, getCopagos } from "../service/coberturas-opcionales.service";



export const usePlanesOpcionales = (
    planName: string, 
    idTipoPlan: number, 
    idCotizante: number, 
    enabled: boolean = true,
    mode?: string,
    quotationId?: string | number
) => {
    return useQuery({
        queryKey: ["planesOpcionales", planName, idTipoPlan, idCotizante, mode, quotationId],
        queryFn: async () => {
            if (!planName) {
                throw new Error("Plan name is required");
            }
            const response = await GetCoberturasOpcionales(planName, idTipoPlan, idCotizante);
            return response;
        },
        // En modo edición, eliminar completamente el caché
        staleTime: mode === "edit" ? 0 : 1000 * 60 * 5,
        gcTime: mode === "edit" ? 0 : 1000 * 60 * 5, // Eliminar del caché inmediatamente en modo edición
        refetchOnMount: mode === "edit" ? "always" : true, // Siempre refetch en modo edición
        enabled: enabled && !!planName
    });
}


// Hook para obtener coberturas opcionales de tipo colectivo
export const useCoberturasOpcionales_colectivo = (
    idOptionalType: number, 
    idPlantype: number,
    mode?: string,
    quotationId?: string | number
) => {
    return useQuery({
        queryKey: ["coberturasOpcionalesColectivo", idOptionalType, idPlantype, mode, quotationId],
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCoberturasOpcionales_colectivo(idOptionalType, idPlantype);
            return response;
        },
        // En modo edición, eliminar completamente el caché
        staleTime: mode === "edit" ? 0 : 1000 * 60 * 5, // 5 minutes
        gcTime: mode === "edit" ? 0 : 1000 * 60 * 5, // Eliminar del caché inmediatamente en modo edición
        refetchOnMount: mode === "edit" ? "always" : true, // Siempre refetch en modo edición
        enabled: !!idOptionalType && !!idPlantype
    });
}


export const useCopagos = (
    idOptionalType: number = 1, 
    idPlantype: number,
    mode?: string,
    quotationId?: string | number
) => {
    return useQuery({
        queryKey: ["copagos", idOptionalType, idPlantype, mode, quotationId],  
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCopagos(idOptionalType, idPlantype);
            return response;
        },
        // En modo edición, eliminar completamente el caché
        staleTime: mode === "edit" ? 0 : 1000 * 60 * 5, // 5 minutes
        gcTime: mode === "edit" ? 0 : 1000 * 60 * 5, // Eliminar del caché inmediatamente en modo edición
        refetchOnMount: mode === "edit" ? "always" : true, // Siempre refetch en modo edición
        enabled: !!idOptionalType && !!idPlantype
    });
}

// Hook para obtener opciones dinámicas por tipo de cobertura
export const useCoberturasOpcionalesByType = (
    coberturaType: string, 
    idPlantype: number, 
    enabled: boolean = true,
    mode?: string,
    quotationId?: string | number
) => {
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
        queryKey: ["coberturasOpcionalesByType", coberturaType, idOptionalType, idPlantype, mode, quotationId],
        queryFn: async () => {
            if (!idOptionalType || !idPlantype) {
                throw new Error("Both idOptionalType and idPlantype are required");
            }
            const response = await getCoberturasOpcionales_colectivo(idOptionalType, idPlantype);
            return response;
        },
        // En modo edición, eliminar completamente el caché
        staleTime: mode === "edit" ? 0 : 1000 * 60 * 5, // 5 minutes
        gcTime: mode === "edit" ? 0 : 1000 * 60 * 5, // Eliminar del caché inmediatamente en modo edición
        refetchOnMount: mode === "edit" ? "always" : true, // Siempre refetch en modo edición
        enabled: enabled && !!idOptionalType && !!idPlantype
    });
}



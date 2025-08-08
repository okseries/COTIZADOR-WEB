import apiClient from "../../../core/apiclient";

export interface Intermediario {
    id:                number;
    nameIntermediario: string;
    documentId:        string;
}

export interface Sucursal {
    id:         number;
    officeName: string;
}

export interface Promotor {
    id:              number;
    promotorName:    string;
    indentification: string;
}


export const GetIntermediarios = async () => {
    try {
        const {data} = await apiClient.get<Intermediario[]>("/intermediarios");
        return data;
    } catch {
        return [];
    }
} 

export const GetSucursales = async () => {
    try {
        const {data} = await apiClient.get<Sucursal[]>("/sucursales");
        return data;
    } catch {
        return [];
    }
}

export const GetPromotores = async () => {
    try {
        const {data} = await apiClient.get<Promotor[]>("/promotores");
        return data;
    } catch {
        return [];
    }
}

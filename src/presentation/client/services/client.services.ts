import apiClient from "../../../../core/apiclient";



interface ClienteReponse {
    NOMBRE_COMPLETO: string
}

export const ClientByIdentification = async (identification: string, identificationType: number) => {
    try {
        const {data} = await apiClient.get<ClienteReponse>(`/users/${identification}/${identificationType}`);
        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching client');
    }
}
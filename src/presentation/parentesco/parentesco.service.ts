import apiClient from "../../core/apiclient";
import { Parentesco } from "./interface/parentesco.interface";


export const GetAllParentesco = async () => {
    try {
        const {data} = await apiClient.get<Parentesco[]>("/parentesco");
        return data;
    } catch (error) {
        console.error("Error fetching parentesco data:", error);
        throw new Error("Failed to fetch parentesco data");
    }
}
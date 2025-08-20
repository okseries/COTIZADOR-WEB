import apiClient from "../../../../core/apiclient";
import { Quotations } from "../interface/quotation.interface";

export interface QuotationListResponse {
  data: Quotations[];
  total: number;
}

class QuotationService {
  /**
   * Obtener cotizaciones por usuario
   */
  async getQuotationsByUser(userName: string): Promise<QuotationListResponse> {
    try {
      const response = await apiClient.get<Quotations[]>(
        `/cotizaciones/${userName}`
      );
      return {
        data: response.data || [],
        total: response.data?.length || 0,
      };
    } catch (error: unknown) {
      console.error("Error al obtener cotizaciones:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response
          ?.status === "number" &&
        (error as { response: { status: number } }).response.status === 401
      ) {
        throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response
          ?.status === "number" &&
        (error as { response: { status: number } }).response.status === 404
      ) {
        // Si no hay cotizaciones, retornar array vacío en lugar de error
        return {
          data: [],
          total: 0,
        };
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response
          ?.status === "number" &&
        (error as { response: { status: number } }).response.status >= 500
      ) {
        throw new Error("Error del servidor. Inténtalo de nuevo más tarde.");
      }
      throw new Error("Error al cargar las cotizaciones. Inténtalo de nuevo.");
    }
  }

 
}

export const quotationService = new QuotationService();

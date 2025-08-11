import apiClient from "../../../../core/apiclient";

export interface QuotationPayload {
  user: string;
  cliente: {
    clientChoosen: number;
    identification: string;
    name: string;
    contact: string;
    email: string;
    address: string;
    office: string;
    agent: string;
    tipoPlan: number;
  };
  planes: Array<{
    plan: string;
    afiliados: Array<{
      plan: string;
      parentesco: string;
      edad: number;
      subtotal: string;
      cantidadAfiliados: number;
    }>;
    opcionales: Array<{
      nombre: string;
      descripcion: string | null;
      prima: number;
    }>;
    resumenPago: {
      subTotalAfiliado: number;
      subTotalOpcional: number;
      periodoPago: string;
      totalPagar: number;
    };
    cantidadAfiliados: number;
    tipo: string;
  }>;
}

export interface QuotationResponse {
  pdfBase64: string;
  filename: string;
}

class PaymentService {
  async generateQuotation(
    payload: QuotationPayload
  ): Promise<QuotationResponse> {
    try {
      const response = await apiClient.post<QuotationResponse>(
        "/cotizaciones",
        payload
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error en calculateQuotation:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const errorResponse = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (errorResponse.response?.data?.message) {
          throw new Error(errorResponse.response.data.message);
        }
        if (errorResponse.response?.status === 401) {
          throw new Error(
            "No autorizado. Por favor, inicia sesión nuevamente."
          );
        }
        if (
          errorResponse.response?.status &&
          errorResponse.response.status >= 500
        ) {
          throw new Error("Error del servidor. Inténtalo de nuevo más tarde.");
        }
      }
      throw new Error(
        "Error al procesar la cotización. Verifica los datos e inténtalo de nuevo."
      );
    }
  }

  async updateQuotation(id: number, payload: QuotationPayload) {
    try {
      const { data } = await apiClient.put(`/cotizaciones/${id}`, payload);
      return data;
    } catch (error) {
      console.error("Error al actualizar la cotización:", error);
      throw new Error(
        "Error al actualizar la cotización. Inténtalo de nuevo más tarde."
      );
    }
  }
}

export const paymentService = new PaymentService();

import apiClient from '../../../../core/apiclient';

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
  async calculateQuotation(payload: QuotationPayload): Promise<QuotationResponse> {
    try {
      const response = await apiClient.post<QuotationResponse>('/cotizaciones', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error en calculateQuotation:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo de nuevo más tarde.');
      }
      
      throw new Error('Error al procesar la cotización. Verifica los datos e inténtalo de nuevo.');
    }
  }
}

export const paymentService = new PaymentService();

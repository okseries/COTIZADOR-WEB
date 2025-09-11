import apiClient from "../../../../core/apiclient";
import { AuthResponse, loginPayload } from "../interface/auth.interface";

/**
 * Servicio de autenticación
 * Maneja las peticiones HTTP relacionadas con auth
 */
export const authService = {
  /**
   * Login del usuario
   * @param payload - Credenciales de usuario
   * @returns Promise con la respuesta completa del servidor
   */
  async login(payload: loginPayload): Promise<AuthResponse> {
    try {
      
      const response = await apiClient.post<AuthResponse>("/login", payload);

      const { data } = response;

      // Verificar si la respuesta contiene un error, incluso con status 200/201
      if (data && typeof data === 'object' && 'ERROR' in data) {
        const errorMessage = (data as { ERROR: string }).ERROR;
        throw new Error(errorMessage);
      }

      // Verificar que tenemos un token válido
      if (!data.token) {
        console.error("No se recibió token en la respuesta");
        throw new Error('No se recibió token de autenticación');
      }

      return data; // Retorna todo el objeto { token: "..." }
    } catch (error: unknown) {
      // Si el error ya es un Error object, simplemente re-lanzarlo
      if (error instanceof Error) {
        throw error;
      }

      // Manejo de errores de red/HTTP
      let message = "Error al conectar con el servidor";
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { ERROR?: string, message?: string, error?: string } } }).response;
        
        if (response?.data?.ERROR) {
          message = response.data.ERROR;
        } else if (response?.data?.message) {
          message = response.data.message;
        } else if (response?.data?.error) {
          message = response.data.error;
        }
      }
      
      throw new Error(message);
    }
  },

  /**
   * Logout del usuario (limpia token del localStorage)
   */
  logout(): void {
    // Limpia el token del localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },
};

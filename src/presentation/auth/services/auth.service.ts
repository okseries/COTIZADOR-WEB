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
      const { data } = await apiClient.post<AuthResponse>("/login", payload);

      return data; // Retorna todo el objeto { token: "..." }
    } catch (error: unknown) {
      // Si el error ya tiene un mensaje personalizado (del servidor), usarlo
      if (typeof error === "object" && error !== null && "message" in error && !("response" in error)) {
        throw error;
      }
      // Manejo más específico de errores de red/HTTP
      let message = "Error al conectar con el servidor";
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { ERROR?: string, message?: string, error?: string } } }).response;
        message = response?.data?.ERROR || response?.data?.message || response?.data?.error || message;
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

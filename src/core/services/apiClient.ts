// Cliente API centralizado
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Añadir token de autenticación si existe
        if (typeof window !== 'undefined') {
          try {
            const authStorageData = localStorage.getItem('auth-storage');
            if (authStorageData) {
              const authData = JSON.parse(authStorageData);
              const token = authData?.state?.user?.data?.access_token;
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            console.warn('Error getting auth token:', error);
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Manejo de errores globales
        if (error.response?.status === 401) {
          // Token expirado o no válido
          if (typeof window !== 'undefined') {
            // Limpiar auth storage y redirigir al login
            localStorage.removeItem('auth-storage');
            window.location.href = '/auth/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Métodos HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
  
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}

// Instancia por defecto
const defaultApiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

export { ApiClient, defaultApiClient };

"use client"

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth.service'
import { useAuthActions, User } from '../store/useAuth.store'
import { loginPayload, AuthResponse } from '../interface/auth.interface'
import { jwtDecode } from 'jwt-decode';

/**
 * Hook para manejar el login del usuario
 * Combina React Query + Zustand + Next.js router
 */
export const useLogin = () => {
  const router = useRouter()
  const { setUser, setToken, setAuthenticated, setChecking } = useAuthActions()

  return useMutation({
    mutationFn: (credentials: loginPayload) => authService.login(credentials),
    
    onMutate: () => {
      setChecking(true)
    },
    
    onSuccess: (data: AuthResponse) => {
      
      // Verificar que tenemos un token válido antes de proceder
      if (!data.token || typeof data.token !== 'string') {
        console.error("Token inválido recibido:", data.token);
        setChecking(false);
        throw new Error('Token de autenticación inválido');
      }

      try {
        // Decodificar el token para obtener información del usuario
        const decodedUser = jwtDecode<User>(data.token);
        
        // Guardar en localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.token)
        }
        
        // Actualizar el store de Zustand
        setToken(data.token)
        setUser(decodedUser)
        setAuthenticated(true)
        setChecking(false)
        
        // Redirigir al dashboard
        router.push('/dashboard')
        
      } catch (error) {
        console.error("Error decodificando token:", error);
        setChecking(false);
        // Lanzar error específico para token inválido
        throw new Error('Token de autenticación inválido')
      }
    },
    
    onError: (error: Error | unknown) => {
      console.log("=== LOGIN ERROR ===");
      console.log("Error recibido:", error);
      console.log("Tipo de error:", typeof error);
      console.log("Error message:", error instanceof Error ? error.message : String(error));
      
      setChecking(false)
      // No re-lanzar el error aquí, React Query ya lo maneja
    }
  })
}

/**
 * Hook para manejar el logout del usuario
 */
export const useLogout = () => {
  const router = useRouter()
  const { logout } = useAuthActions()

  return useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    
    onSuccess: () => {
      // Limpiar estado de Zustand
      logout()
      
      // Redirigir al login
      router.push('/auth/login')
    }
  })
}

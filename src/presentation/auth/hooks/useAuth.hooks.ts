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
        setChecking(false);
        return;
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
        
      } catch {
                setChecking(false);
                // Aquí podrías mostrar un error específico de token inválido
      }
    },
    
    onError: () => {
      setChecking(false)
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

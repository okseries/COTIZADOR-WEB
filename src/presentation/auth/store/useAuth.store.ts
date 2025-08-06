import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthResponse } from '../interface/auth.interface'
import { jwtDecode } from 'jwt-decode'

export interface User {
  exp: number;
  aud: string;
  data: {
    id: string;
    user: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface AuthState {
  // Estado de cliente
  user: User | null
  isAuthenticated: boolean
  isChecking: boolean
  token: string | null
  
  // Acciones para actualizar el estado local
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setChecking: (checking: boolean) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isChecking: true, // Inicia en true mientras verifica
      token: null,

      // Acciones para el estado local
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      setChecking: (checking) => set({ isChecking: checking }),
      
      logout: () => {
        // Limpiar localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
        }
        set({
          user: null,
          isAuthenticated: false,
          token: null
        })
      },

      // Función para inicializar el estado de autenticación al cargar la app
      initializeAuth: () => {
        set({ isChecking: true })
        
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token")
          if (token) {
            try {
              const decodedUser = jwtDecode<User>(token)
              
              // Verificar si el token no ha expirado
              const currentTime = Date.now() / 1000
              if (decodedUser.exp > currentTime) {
                set({
                  user: decodedUser,
                  token: token,
                  isAuthenticated: true,
                  isChecking: false
                })
              } else {
                // Token expirado, limpiar
                localStorage.removeItem("access_token")
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isChecking: false
                })
              }
            } catch (error) {
              // Token inválido, limpiar
              localStorage.removeItem("access_token")
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isChecking: false
              })
            }
          } else {
            // No hay token
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isChecking: false
            })
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persistir todos los datos de autenticación
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
)

// Hook optimizado para leer estado de auth
export const useAuth = () => {
  const { user, isAuthenticated, isChecking, token } = useAuthStore()
  return { user, isAuthenticated, isChecking, token }
}

//Hook para acciones de auth (sin persistir)
export const useAuthActions = () => {
  const { setUser, setToken, setAuthenticated, setChecking, logout, initializeAuth } = useAuthStore()
  return { setUser, setToken, setAuthenticated, setChecking, logout, initializeAuth }
}

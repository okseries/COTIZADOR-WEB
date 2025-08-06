"use client"

import { useEffect } from "react"
import { useAuthActions } from "../store/useAuth.store"

export function AuthInitializer() {
  const { initializeAuth } = useAuthActions()

  useEffect(() => {
    // Inicializar el estado de autenticación al cargar la app
    initializeAuth()
  }, [initializeAuth])

  return null // Este componente no renderiza nada
}

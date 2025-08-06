"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../store/useAuth.store'
import { LoadingSpinner } from '@/components/shared/loading'

interface AuthGuardProps {
  children: React.ReactNode
  fallbackUrl?: string
}

export function AuthGuard({ 
  children, 
  fallbackUrl = '/auth/login',
}: AuthGuardProps) {  
  const { isAuthenticated, isChecking } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Solo redirigir si ya terminó de verificar y no está autenticado
    if (!isChecking && !isAuthenticated) {
      router.push(fallbackUrl)
    }
  }, [isAuthenticated, isChecking, router, fallbackUrl])

  // Mostrar spinner mientras verifica autenticación
  if (isChecking) {
    return <LoadingSpinner />
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}

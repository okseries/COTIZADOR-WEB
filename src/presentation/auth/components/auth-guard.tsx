"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../store/useAuth.store'
import { Spinner } from '@/components/shared/Spinner'

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#005BBB]/5 to-[#FFA500]/5">
        <div className="text-center">
          <Spinner size="xl" color="primary" className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}

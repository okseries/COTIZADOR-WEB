"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/auth/store/useAuth.store'
import { Spinner } from '@/components/shared/Spinner'

export default function Home() {
  const { isAuthenticated, isChecking } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isChecking) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, isChecking, router])

  // Mostrar spinner mientras verifica autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#005BBB]/5 to-[#FFA500]/5">
        <div className="text-center">
          <Spinner size="xl" color="primary" className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  // No renderizar nada mientras redirige
  return null
}

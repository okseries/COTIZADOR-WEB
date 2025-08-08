"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/auth/store/useAuth.store'
import { LoadingSpinner } from '@/components/shared/loading'

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // No renderizar nada mientras redirige
  return null
}

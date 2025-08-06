"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../store/useAuth.store"

interface AuthRedirectProps {
  redirectTo?: string
  redirectWhen?: "authenticated" | "unauthenticated"
  useReturnUrl?: boolean
}

export function AuthRedirect({ 
  redirectTo = "/dashboard", 
  redirectWhen = "authenticated",
  useReturnUrl = false
}: AuthRedirectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    let finalRedirectTo = redirectTo
    
    // Si está configurado para usar returnUrl, obtenerlo de los parámetros
    if (useReturnUrl && isAuthenticated) {
      finalRedirectTo = searchParams.get('returnUrl') || redirectTo
    }

    if (redirectWhen === "authenticated" && isAuthenticated) {
      router.push(finalRedirectTo)
    } else if (redirectWhen === "unauthenticated" && !isAuthenticated) {
      router.push(finalRedirectTo)
    }
  }, [isAuthenticated, router, redirectTo, redirectWhen, searchParams, useReturnUrl])

  // No renderizar nada si se está redirigiendo
  if (
    (redirectWhen === "authenticated" && isAuthenticated) ||
    (redirectWhen === "unauthenticated" && !isAuthenticated)
  ) {
    return null
  }

  return null
}

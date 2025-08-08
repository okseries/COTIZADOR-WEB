"use client"
import AuthForm from '@/presentation/auth/components/AuthForm'
import React, { Suspense } from 'react'

const LoginScreen = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthForm/>
    </Suspense>
  )
}

export default LoginScreen

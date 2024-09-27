'use client'

import { useEffect } from 'react'
import { AuthModal } from '@/components/AuthModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (user) {
      router.push('/')
    }
    
    // Asegurarse de que el modal se abra automáticamente al cargar la página
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [user, router])

  const handleCloseOrSuccess = () => {
    router.push('/')
  }

  // Si el usuario está autenticado, no renderizar nada (la redirección se manejará en el useEffect)
  if (user) {
    return null
  }

  return (
    <AuthModal
      isOpen={true}
      onClose={handleCloseOrSuccess}
      onSuccess={handleCloseOrSuccess}
    />
  )
}
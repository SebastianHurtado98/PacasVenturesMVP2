'use client'

import { useState } from 'react'
import { RegisterModal } from '@/components/RegisterModal'
import { LoginModal } from '@/components/LoginModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)

  const handleSwitchToRegister = () => setIsLogin(false)
  const handleSwitchToLogin = () => setIsLogin(true)

  return (
    <>
      {isLogin ? (
        <LoginModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <RegisterModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  )
}
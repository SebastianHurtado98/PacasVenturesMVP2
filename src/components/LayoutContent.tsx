'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/components/AuthProvider'

interface LayoutContentProps {
  children: React.ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user } = useAuth()

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    // You might want to add additional logic here, such as refreshing the page or updating the user state
  }

  return (
    <>
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Licibit</h1>
          <nav>
            <Link href="/" className="text-white mr-4 hover:underline">
              Licitaciones
            </Link>
            {user ? (
              <>
                <Link href="/mis-cotizaciones" className="text-white mr-4 hover:underline">
                  Mis cotizaciones
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Button 
                className="text-black hover:bg-gray-200 bg-white"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Iniciar sesión
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
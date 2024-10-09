'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/LogoutButton'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/components/AuthProvider'
import { useSupabase } from '@/components/supabase-provider'

interface LayoutContentProps {
  children: React.ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    async function getUserType() {
      if (user) {
        const { data, error } = await supabase
          .from('user')
          .select('user_type')
          .eq('auth_user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user type:', error)
        } else if (data) {
          setUserType(data.user_type)
        }
      }
    }

    getUserType()
  }, [user, supabase])

  console.log("USER", user)

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    // You might want to add additional logic here, such as refreshing the page or updating the user state
  }

  return (
    <>
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Licibit</h1>
            {user && userType && (
              <nav className="space-x-4">
                {userType === 'constructora' && (
                  <>
                    <Link href="/constructora/proyectos/all/licitaciones" className="text-white hover:underline">
                      Mis Licitaciones
                    </Link>
                    <Link href="/constructora/proyectos" className="text-white hover:underline">
                      Mis Proyectos
                    </Link>
                  </>
                )}
                {userType === 'proveedor' && (
                  <Link href="/proveedor/mis-cotizaciones" className="text-white hover:underline">
                    Mis Cotizaciones
                  </Link>
                )}
              </nav>
            )}
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-white hover:underline">
              Licitaciones
            </Link>
            {user ? (
              <LogoutButton />
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
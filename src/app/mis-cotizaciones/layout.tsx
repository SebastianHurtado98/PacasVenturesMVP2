'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"

export default function ProveedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      })

      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Licitaciones
              </Link>
            </li>
            <li>
              <Link href="/proveedor/cotizaciones" className="text-blue-600 hover:underline">
                Mis Cotizaciones
              </Link>
            </li>
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        {children}
      </main>
    </div>
  )
}
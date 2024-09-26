import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SupabaseProvider from '@/components/supabase-provider'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Licibit',
  description: 'Plataforma para gestionar licitaciones entre constructoras y proveedores',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="es">
      <body className={inter.className}>
        <SupabaseProvider session={session}>
          <AuthProvider>
            <header className="bg-blue-600 text-white p-4">
              <h1 className="text-2xl font-bold">Licibit</h1>
            </header>
            <main className="container mx-auto p-4">
              {children}
            </main>
            <footer className="bg-gray-200 p-4 mt-8">
              <p className="text-center text-gray-600">© 2024 Licibit</p>
            </footer>
            <Toaster />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
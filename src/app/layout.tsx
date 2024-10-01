import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SupabaseProvider from '@/components/supabase-provider'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/AuthProvider'
import LayoutContent from '@/components/LayoutContent'
import { Footer } from '@/components/Footer'

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
            <LayoutContent>
              {children}
            </LayoutContent>
            <Footer/>
            <Toaster />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
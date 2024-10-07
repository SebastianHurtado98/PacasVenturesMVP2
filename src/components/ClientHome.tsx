'use client'

import { ThemeProvider } from "next-themes"
import { Container } from "@/components/Container"
import Licitaciones from '@/components/Licitaciones'
import { AuthModal } from "@/components/AuthModal"
import { useAuth } from "@/components/AuthProvider"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Bid {
    id: number
    partida: string
    publication_end_date: string
    job_start_date: string
    initial_budget: number
    project: {
      name: string
      location: string
    }
    main_description: string
    active: boolean
    user: {
      enterprise_name: string
      company_logo: string
    }
  }
interface ClientHomeProps {
  initialBids: Bid[]
  children: React.ReactNode
}

export default function ClientHome({ initialBids, children }: ClientHomeProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleAuthAction = () => {
    if (user) {
      router.push('/')
    } else {
      setIsAuthModalOpen(true)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Container>
        {children}
        <div className="min-h-screen">
          <main className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Licitaciones
            </h1>
            <Licitaciones initialBids={initialBids} />
          </main>
        </div>
      </Container>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          router.push('/')
        }}
      />
    </ThemeProvider>
  )
}
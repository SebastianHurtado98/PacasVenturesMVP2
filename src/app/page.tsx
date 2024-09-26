'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Bid {
  id: number
  partida: string
  publication_end_date: string
  location: string
  job_start_date: string
  initial_budget: number
}

export default function Home() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBids() {
      try {
        const { data, error } = await supabase
          .from('bid')
          .select('id, partida, publication_end_date, location, job_start_date, initial_budget')
          .order('publication_end_date', { ascending: false })

        if (error) throw error

        setBids(data || [])
      } catch (error) {
        console.error('Error fetching bids:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las licitaciones. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBids()
  }, [supabase, toast])

  if (isLoading) return <div className="text-center py-10">Cargando...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Licitaciones Activas
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partida</TableHead>
                <TableHead>Fecha de Cierre</TableHead>
                <TableHead>Presupuesto inicial</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>{bid.partida}</TableCell>
                  <TableCell>{new Date(bid.publication_end_date).toLocaleDateString()}</TableCell>
                  <TableCell>${bid.initial_budget.toLocaleString()}</TableCell>
                  <TableCell>{bid.location}</TableCell>
                  <TableCell>{new Date(bid.job_start_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => router.push(`/licitacion/${bid.id}`)}>
                      Ver detalle y cotizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Licibit. Todos los derechos reservados.</p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
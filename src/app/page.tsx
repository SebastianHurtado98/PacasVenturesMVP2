'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import CountdownTimer from '@/components/CountdownTimer'
import { specializations } from '@/utils/specializations'

interface Bid {
  id: number
  partida: string
  publication_end_date: string
  location: string
  job_start_date: string
  initial_budget: number
  company_logo: string
  project_name: string
  main_description: string
  user: {
    enterprise_name: string
  }
}

export default function Home() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [bids, setBids] = useState<Bid[]>([])
  const [filteredBids, setFilteredBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [partidas, setPartidas] = useState<string[]>([])
  const [selectedPartidas, setSelectedPartidas] = useState<string[]>([])

  useEffect(() => {
    async function fetchBids() {
      try {
        const { data, error } = await supabase
        .from('bid')
        .select(`
          *,
          user (enterprise_name)
        `)
        .order('publication_end_date', { ascending: false });

        console.log('data:', data)

        if (error) throw error

        if (data) {
          const typedBids: Bid[] = data.map(bid => ({
            ...bid,
            user: bid.user || { enterprise_name: 'Desconocido' }
          }))
          setBids(typedBids)
          setFilteredBids(typedBids)
        
          // Extract unique partidas
          const uniquePartidas = Array.from(new Set(typedBids.map(bid => bid.partida)))
          setPartidas(uniquePartidas)
        }
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

  useEffect(() => {
    if (selectedPartidas.length === 0) {
      setFilteredBids(bids)
    } else {
      const filtered = bids.filter(bid => selectedPartidas.includes(bid.partida))
      setFilteredBids(filtered)
    }
  }, [selectedPartidas, bids])

  const handlePartidasChange = (selected: string[]) => {
    setSelectedPartidas(selected)
  }

  if (isLoading) return <div className="text-center py-10">Cargando...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Licitaciones Activas
        </h1>

        <div className="mb-8">
          <label htmlFor="partidas-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Partidas
          </label>
          <MultiSelectDropdown
            options={specializations}
            selectedOptions={selectedPartidas}
            onChange={handlePartidasChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBids.map((bid) => (
            <Card key={bid.id} className="flex flex-col">
              <CardHeader>
                <div className="w-full h-40 relative mb-4">
                  <Image
                    src={bid.company_logo || '/placeholder.svg'}
                    alt={`Logo de ${bid.user.enterprise_name}`}
                    layout="fill"
                    objectFit="contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardTitle>{bid.project_name}</CardTitle>
                <p className="text-sm text-gray-500">{bid.user.enterprise_name}</p>
                <p className="text-sm text-gray-700 mt-2">{bid.main_description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p><strong>Partida:</strong> {bid.partida}</p>
                <p>
                  <strong>Fecha de Cierre:</strong> {new Date(bid.publication_end_date).toLocaleDateString()}
                  {' '}
                  (<CountdownTimer endDate={bid.publication_end_date} />)
                </p>
                <p><strong>Presupuesto inicial:</strong> ${bid.initial_budget.toLocaleString()}</p>
                <p><strong>Ubicación:</strong> {bid.location}</p>
                <p><strong>Fecha de Inicio:</strong> {new Date(bid.job_start_date).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push(`/licitacion/${bid.id}`)} className="w-full">
                  Ver detalle y cotizar
                </Button>
              </CardFooter>
            </Card>
          ))}
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
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type ProposalState = 'sent' | 'accepted' | 'rejected'

interface Bid {
  partida: string
}

interface Proposal {
  id: number
  bid_id: number
  budget: number
  state: ProposalState
  created_at: string
  bid: Bid
}

export default function MisCotizaciones() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProposals() {
      try {
        const { data, error } = await supabase
          .from('proposal')
          .select(`
            id,
            bid_id,
            budget,
            state,
            created_at,
            bid (
              partida
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const typedProposals: Proposal[] = data.map(item => ({
            id: item.id,
            bid_id: item.bid_id,
            budget: item.budget,
            state: item.state as ProposalState,
            created_at: item.created_at,
            bid: Array.isArray(item.bid) ? item.bid[0] : item.bid
          }))
          setProposals(typedProposals)
        }
      } catch (error) {
        console.error('Error fetching proposals:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las cotizaciones. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposals()
  }, [supabase, toast])

  if (isLoading) return <div className="text-center py-10">Cargando...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Cotizaciones</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licitación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Envío</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td className="px-6 py-4 whitespace-nowrap">{proposal.bid.partida}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(proposal.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">${proposal.budget.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    proposal.state === 'accepted' ? 'bg-green-100 text-green-800' :
                    proposal.state === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {proposal.state === 'sent' ? 'Enviada' :
                     proposal.state === 'accepted' ? 'Aceptada' :
                     'Rechazada'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" onClick={() => router.push(`/proveedor/cotizaciones/${proposal.id}`)}>
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toaster />
    </div>
  )
}
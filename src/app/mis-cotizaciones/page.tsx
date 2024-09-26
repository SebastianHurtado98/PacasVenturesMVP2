'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
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
  delivery_time: string
  payment_method: string
  guarantee: string
  file_id: number | null
  bid: Bid
}

export default function MisCotizaciones() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProposals() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('proposal')
          .select(`
            id,
            bid_id,
            budget,
            state,
            created_at,
            delivery_time,
            payment_method,
            guarantee,
            file_id,
            bid (
              partida
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const typedProposals: Proposal[] = data.map(item => ({
            ...item,
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
  }, [supabase, toast, user])

  const handleFileDownload = async (fileId: number) => {
    try {
      const { data, error } = await supabase
        .from('proposal_doc')
        .select('file_path, file_name')
        .eq('id', fileId)
        .single()

      if (error) throw error

      if (data) {
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('proposal_files')
          .download(data.file_path)

        if (downloadError) throw downloadError

        const blob = new Blob([fileData], { type: 'application/octet-stream' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = data.file_name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div className="text-center py-10">Cargando...</div>

  if (!user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
        <p className="mb-4">Debes iniciar sesión para ver tus cotizaciones.</p>
        <Button onClick={() => router.push('/login')}>
          Iniciar Sesión
        </Button>
      </div>
    )
  }

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo de Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garantía</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
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
                <td className="px-6 py-4 whitespace-nowrap">{proposal.delivery_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{proposal.payment_method}</td>
                <td className="px-6 py-4 whitespace-nowrap">{proposal.guarantee}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {proposal.file_id ? (
                    <Button size="sm" onClick={() => handleFileDownload(proposal.file_id!)}>
                      Descargar
                    </Button>
                  ) : (
                    <span className="text-gray-400">Sin archivo</span>
                  )}
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
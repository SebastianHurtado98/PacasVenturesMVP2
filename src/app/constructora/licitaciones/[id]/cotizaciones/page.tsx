'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { Loader2, Download } from 'lucide-react'

interface Proposal {
  id: number
  user_id: string
  extra_info: string
  state: 'sent' | 'accepted' | 'rejected'
  user: {
    user_name: string
    email: string
    enterprise_name: string
  }
  documents: {
    id: number
    file_name: string
    file_path: string
  }[]
}

export default function Cotizaciones({ params }: { params: { id: string } }) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { supabase } = useSupabase()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProposals = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposal')
          .select(`
            id,
            user_id,
            extra_info,
            state,
            user (
              user_name,
              email,
              enterprise_name
            )
          `)
          .eq('bid_id', params.id)

        if (proposalsError) throw proposalsError

        const proposalsWithDocs = await Promise.all(proposalsData.map(async (proposal) => {
          const { data: docsData, error: docsError } = await supabase
            .from('proposal_doc')
            .select('id, file_name, file_path')
            .eq('proposal_id', proposal.id)

          if (docsError) throw docsError

          // Forzar el tipo de user a un objeto único en lugar de un array
          const user = Array.isArray(proposal.user) ? proposal.user[0] : proposal.user

          return { 
            ...proposal, 
            user: user as Proposal['user'],  // Forzar el tipo
            documents: docsData 
          }
        }))

        setProposals(proposalsWithDocs)
      } catch (error) {
        console.error('Error fetching proposals:', error)
        setError('Error al cargar las cotizaciones. Por favor, intenta de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposals()
  }, [supabase, user, router, params.id])

  const handleStateChange = async (proposalId: number, newState: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('proposal')
        .update({ state: newState })
        .eq('id', proposalId)

      if (error) throw error

      setProposals(proposals.map(proposal => 
        proposal.id === proposalId ? { ...proposal, state: newState } : proposal
      ))
    } catch (error) {
      console.error('Error updating proposal state:', error)
      setError('Error al actualizar el estado de la cotización. Por favor, intenta de nuevo.')
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('proposal_files')
        .download(filePath)

      if (error) throw error

      const blob = new Blob([data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Error al descargar el archivo. Por favor, intenta de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'accepted':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStateText = (state: string) => {
    switch (state) {
      case 'sent':
        return 'Pendiente'
      case 'accepted':
        return 'Aprobado'
      case 'rejected':
        return 'Rechazado'
      default:
        return ''
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <CardTitle>{proposal.user.enterprise_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Nombre:</strong> {proposal.user.user_name}</p>
              <p><strong>Email:</strong> {proposal.user.email}</p>
              <p><strong>Información adicional:</strong> {proposal.extra_info}</p>
              <p>
                <strong>Estado:</strong> 
                <span className={`ml-2 font-semibold ${getStateColor(proposal.state)}`}>
                  {getStateText(proposal.state)}
                </span>
              </p>
              <div className="mt-4">
                <strong>Documentos:</strong>
                {proposal.documents.map((doc) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    size="sm"
                    className="mt-2 mr-2"
                    onClick={() => handleDownload(doc.file_path, doc.file_name)}
                  >
                    <Download className="mr-2 h-4 w-4" /> {doc.file_name}
                  </Button>
                ))}
              </div>
              <div className="mt-4 space-x-2">
                <Button
                  onClick={() => handleStateChange(proposal.id, 'accepted')}
                  disabled={proposal.state === 'accepted'}
                >
                  Aprobar
                </Button>
                <Button
                  onClick={() => handleStateChange(proposal.id, 'rejected')}
                  variant="destructive"
                  disabled={proposal.state === 'rejected'}
                >
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
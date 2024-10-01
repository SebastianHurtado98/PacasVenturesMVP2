'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, Download, MessageCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WHATSAPP_NUMBER, BASE_URL } from '@/utils/constants'

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

export default function Cotizaciones({ params }: { params: { id: string, licitacionId: string } }) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterState, setFilterState] = useState<'all' | 'sent' | 'accepted' | 'rejected'>('all')

  const { supabase } = useSupabase()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProposals = async () => {
      setIsLoading(true)
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
          .eq('bid_id', params.licitacionId)

        if (proposalsError) throw proposalsError

        const proposalsWithDocs = await Promise.all(proposalsData.map(async (proposal) => {
          const { data: docsData, error: docsError } = await supabase
            .from('proposal_doc')
            .select('id, file_name, file_path')
            .eq('proposal_id', proposal.id)

          if (docsError) throw docsError

          const user = Array.isArray(proposal.user) ? proposal.user[0] : proposal.user

          return { 
            ...proposal, 
            user: user as Proposal['user'],
            documents: docsData 
          }
        }))

        setProposals(proposalsWithDocs)
        setFilteredProposals(proposalsWithDocs)
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
  }, [supabase, user, router, params.licitacionId, toast])

  useEffect(() => {
    if (filterState === 'all') {
      setFilteredProposals(proposals)
    } else {
      setFilteredProposals(proposals.filter(proposal => proposal.state === filterState))
    }
  }, [filterState, proposals])

  const handleStateChange = async (proposalId: number, newState: 'sent' | 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('proposal')
        .update({ state: newState })
        .eq('id', proposalId)

      if (error) throw error

      setProposals(proposals.map(proposal => 
        proposal.id === proposalId ? { ...proposal, state: newState } : proposal
      ))

      toast({
        title: "Estado actualizado",
        description: "El estado de la cotización se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error('Error updating proposal state:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cotización. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const getStateText = (state: string) => {
    switch (state) {
      case 'sent':
        return 'Pendiente'
      case 'accepted':
        return 'Contactar'
      case 'rejected':
        return 'Rechazar'
      default:
        return ''
    }
  }

  const handleWhatsAppAction = (proposal: Proposal) => {
    if (proposal.state === 'accepted') {
      const message = encodeURIComponent(`¡Hola! Quiero conectar con el proveedor de la siguiente cotización en Licibit: ${BASE_URL}/admin/cotizacion/${proposal.id}`)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>
      <div className="mb-4">
        <Select onValueChange={(value: 'all' | 'sent' | 'accepted' | 'rejected') => setFilterState(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sent">Pendiente</SelectItem>
            <SelectItem value="accepted">Contactar</SelectItem>
            <SelectItem value="rejected">Rechazar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la empresa</TableHead>
            <TableHead>Propuesta económica</TableHead>
            <TableHead>Información adicional</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Contactar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell>{proposal.user.enterprise_name}</TableCell>
              <TableCell>
                {proposal.documents.map((doc) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    size="sm"
                    className="mr-2 mb-2"
                    onClick={() => handleDownload(doc.file_path, doc.file_name)}
                  >
                    <Download className="mr-2 h-4 w-4" /> {doc.file_name}
                  </Button>
                ))}
              </TableCell>
              <TableCell>{proposal.extra_info}</TableCell>
              <TableCell>
                <Select 
                  onValueChange={(value: 'sent' | 'accepted' | 'rejected') => handleStateChange(proposal.id, value)}
                  defaultValue={proposal.state}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={getStateText(proposal.state)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sent">Pendiente</SelectItem>
                    <SelectItem value="accepted">Contactar</SelectItem>
                    <SelectItem value="rejected">Rechazar</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWhatsAppAction(proposal)}
                  disabled={proposal.state !== 'accepted'}
                >
                  <MessageCircle className={`h-6 w-6 ${proposal.state === 'accepted' ? 'text-green-500' : 'text-gray-400'}`} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Toaster />
    </div>
  )
}
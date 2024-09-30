'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from 'lucide-react'

type ProposalState = 'sent' | 'accepted' | 'rejected'

interface Bid {
  id: number
  partida: string
  project: {
    name: string
  }
  user: {
    enterprise_name: string
  }
}

interface Proposal {
  id: number
  bid_id: number
  state: ProposalState
  created_at: string
  extra_info: string
  bid: Bid
}

interface ProposalFileInfo {
  id: number;
  proposal_id: number;
  file_name: string;
  file_path: string;
}

export default function MisCotizaciones() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [proposalFiles, setProposalFiles] = useState<{[key: number]: ProposalFileInfo[]}>({})
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
            *,
            bid (
              id,
              partida,
              project (
                name
              ),
              user (
                enterprise_name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const typedProposals: Proposal[] = data.map(item => ({
            ...item,
            bid: Array.isArray(item.bid) ? item.bid[0] : item.bid
          }))
          setProposals(typedProposals) 

          // Fetch files for all proposals
          const filesPromises = typedProposals.map(proposal => 
            supabase
              .from('proposal_doc')
              .select('*')
              .eq('proposal_id', proposal.id)
          )
          const filesResults = await Promise.all(filesPromises)
          const filesMap: {[key: number]: ProposalFileInfo[]} = {}
          filesResults.forEach((result, index) => {
            if (result.data) {
              filesMap[typedProposals[index].id] = result.data
            }
          })
          setProposalFiles(filesMap)
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

  const handleFileOpen = async (filePath: string, fileName: string) => {
    try {
      const { data } = await supabase
        .storage
        .from('proposal_files')
        .getPublicUrl(filePath)
  
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank')
      } else {
        throw new Error('No se pudo obtener la URL pública del archivo')
      }
    } catch (error) {
      console.error('Error opening file:', error)
      toast({
        title: "Error",
        description: "No se pudo abrir el archivo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const toggleRowExpansion = (proposalId: number) => {
    setExpandedRows(prevExpandedRows => 
      prevExpandedRows.includes(proposalId)
        ? prevExpandedRows.filter(id => id !== proposalId)
        : [...prevExpandedRows, proposalId]
    )
  }

  const navigateToLicitacionDetail = (bidId: number) => {
    router.push(`/licitacion/${bidId}`)
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partida</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Envío</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <>
                <tr key={proposal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(proposal.id)}
                    >
                      {expandedRows.includes(proposal.id) ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.bid.partida}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.bid.user.enterprise_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.bid.project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(proposal.created_at).toLocaleDateString()}</td>
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
                </tr>
                {expandedRows.includes(proposal.id) && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Archivos adjuntos:</h4>
                        {proposalFiles[proposal.id] && proposalFiles[proposal.id].length > 0 ? (
                          <ul className="list-disc pl-5">
                            {proposalFiles[proposal.id].map((file) => (
                              <li key={file.id} className="mb-2">
                                <Button
                                  variant="link"
                                  onClick={() => handleFileOpen(file.file_path, file.file_name)}
                                  className="flex items-center"
                                >
                                  {file.file_name}
                                  <ExternalLinkIcon className="ml-2 h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No hay archivos adjuntos</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Comentario:</h4>
                        <p>{proposal.extra_info || 'Sin comentarios'}</p>
                      </div>
                      <Button onClick={() => navigateToLicitacionDetail(proposal.bid.id)}>
                        Ver detalle de la licitación
                      </Button>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <Toaster />
    </div>
  )
}
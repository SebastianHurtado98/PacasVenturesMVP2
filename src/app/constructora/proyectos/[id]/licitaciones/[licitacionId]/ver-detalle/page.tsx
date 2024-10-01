'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/AuthProvider'
import CountdownTimer from '@/components/CountdownTimer'
import { Loader2, Download, Edit } from 'lucide-react'

interface Licitacion {
  id: number
  active: boolean
  partida: string
  publication_end_date: string
  job_start_date: string
  description: string
  project_id: number
  user_id: string
  created_at: string
  project: {
    name: string
    location: string
  }
  user: {
    enterprise_name: string
  }
}

interface FileInfo {
  id: number
  file_name: string
  file_path: string
  bid_id: number
}

interface LinkInfo {
  id: number
  link: string
  link_name: string
  bid_id: number
}

export default function LicitacionDetalle() {
  const { id: project_id, licitacionId } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { user } = useAuth()
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null)
  const [bidFiles, setBidFiles] = useState<FileInfo[]>([])
  const [bidLinks, setBidLinks] = useState<LinkInfo[]>([])
  const [bidSignedUrls, setBidSignedUrls] = useState<{ [key: number]: string }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLicitacionData = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data: licitacionData, error: licitacionError } = await supabase
          .from('bid')
          .select(`
            *,
            project (name, location),
            user (enterprise_name)
          `)
          .eq('id', licitacionId)
          .single()

        if (licitacionError) throw licitacionError
        setLicitacion(licitacionData)

        const { data: filesData, error: filesError } = await supabase
          .from('bid_doc')
          .select('*')
          .eq('bid_id', licitacionId)

        if (filesError) throw filesError
        setBidFiles(filesData || [])

        const { data: linksData, error: linksError } = await supabase
          .from('bid_link')
          .select('*')
          .eq('bid_id', licitacionId)

        if (linksError) throw linksError
        setBidLinks(linksData || [])

        const signedUrls: { [key: number]: string } = {}
        for (const file of filesData || []) {
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('bid_files')
            .createSignedUrl(file.file_path, 60)

          if (urlError) throw urlError
          signedUrls[file.id] = urlData.signedUrl
        }
        setBidSignedUrls(signedUrls)

      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la licitación.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicitacionData()
  }, [supabase, licitacionId, user, router, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!licitacion) return <div className="text-center py-10">No se encontró la licitación</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{licitacion.project.name} - Licitación</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalles de la Licitación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Estado</p>
              <p className="font-semibold">{licitacion.active ? 'Activa' : 'Inactiva'}</p>
            </div>
            <div>
              <p className="text-gray-600">Partida</p>
              <p className="font-semibold">{licitacion.partida}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha de cierre</p>
              <p className="font-semibold">
                {new Date(licitacion.publication_end_date).toLocaleDateString()}
                {' '}
                (<CountdownTimer endDate={licitacion.publication_end_date} />)
              </p>
            </div>
            <div>
              <p className="text-gray-600">Fecha de inicio del trabajo</p>
              <p className="font-semibold">{new Date(licitacion.job_start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Empresa</p>
              <p className="font-semibold">{licitacion.user.enterprise_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha de creación</p>
              <p className="font-semibold">{new Date(licitacion.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Detalle del requerimiento</p>
            <p className="mt-2">{licitacion.description}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Archivos y Enlaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Documentos adjuntos</h3>
              {bidFiles.length > 0 ? (
                bidFiles.map((file) => (
                  <div key={file.id} className="mb-2">
                    {bidSignedUrls[file.id] ? (
                      <Button asChild variant="outline" className="w-full">
                        <a href={bidSignedUrls[file.id]} download={file.file_name} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          {file.file_name}
                        </a>
                      </Button>
                    ) : (
                      <p className="text-red-500">Error al generar el enlace de descarga para {file.file_name}</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No hay documentos adjuntos</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Enlaces adjuntos</h3>
              {bidLinks.length > 0 ? (
                bidLinks.map((link) => (
                  <Button key={link.id} asChild variant="outline" className="w-full mb-2">
                    <a href={link.link} target="_blank" rel="noopener noreferrer">
                      {link.link_name}
                    </a>
                  </Button>
                ))
              ) : (
                <p>No hay enlaces adjuntos</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button onClick={() => router.push('/constructora/proyectos')}>Volver</Button>
        <Link href={`/constructora/proyectos/${project_id}/licitaciones/${licitacionId}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Licitación
          </Button>
        </Link>
      </div>
      <Toaster />
    </div>
  )
}
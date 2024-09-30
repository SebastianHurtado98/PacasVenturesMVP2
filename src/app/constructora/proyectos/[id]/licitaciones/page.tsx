'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

interface Licitacion {
  id: number
  description: string
  partida: string
  publication_end_date: string
  active: boolean
}

export default function LicitacionesProyecto() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLicitaciones = async () => {
      try {
        const { data, error } = await supabase
          .from('bid')
          .select('id, partida, publication_end_date, active, description')
          .eq('project_id', id)

        if (error) {
          throw error
        }

        setLicitaciones(data || [])
      } catch (error) {
        console.error('Error fetching licitaciones:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las licitaciones. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicitaciones()
  }, [id, supabase, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Licitaciones del Proyecto {id}</h1>
      {licitaciones.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detalle del Requerimiento</TableHead>
                <TableHead>Partida</TableHead>
                <TableHead>Fecha de Cierre</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licitaciones.map((licitacion) => (
                <TableRow key={licitacion.id}>
                  <TableCell>{licitacion.description}</TableCell>
                  <TableCell>{licitacion.partida}</TableCell>
                  <TableCell>{new Date(licitacion.publication_end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{licitacion.active ? 'Activo' : 'Inactivo'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center py-4">No hay licitaciones para este proyecto.</p>
      )}
      <div className="mt-4">
        <Link href={`/constructora/proyectos/${id}/crear-licitacion`}>
          <Button>Crear Licitación</Button>
        </Link>
      </div>
    </div>
  )
}
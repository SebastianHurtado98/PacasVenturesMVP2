'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

interface Licitacion {
  id: number
  nombre: string
  proyecto: {
    name: string
  }
  partida: string
  cotizaciones: number
}

export default function Licitaciones() {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([])
  const [filtroProyecto, setFiltroProyecto] = useState('todos')
  const [filtroPartida, setFiltroPartida] = useState('todas')
  const [proyectos, setProyectos] = useState<string[]>([])
  const [partidas, setPartidas] = useState<string[]>([])
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

    const fetchLicitaciones = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (userError) throw userError

        const { data, error } = await supabase
          .from('bid')
          .select(`
            id,
            nombre: description,
            proyecto: project(name),
            partida,
            cotizaciones: proposal(count)
          `)
          .eq('user_id', userData.id)

        if (error) throw error

        const licitacionesData: Licitacion[] = data.map(item => ({
          id: item.id,
          nombre: item.nombre,
          proyecto: {name: item.proyecto[0]?.name},
          partida: item.partida,
          cotizaciones: item.cotizaciones[0].count
        }))

        setLicitaciones(licitacionesData)

        //const uniqueProyectos = [...new Set(licitacionesData.map(l => l.proyecto[0]?.name))]
        //const uniquePartidas = [...new Set(licitacionesData.map(l => l.partida))]

        setProyectos([])
        setPartidas([])
      } catch (error) {
        console.error('Error fetching licitaciones:', error)
        setError('Error al cargar las licitaciones. Por favor, intenta de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicitaciones()
  }, [supabase, user, router])

  const licitacionesFiltradas = licitaciones.filter(licitacion => 
    (filtroProyecto === 'todos' || licitacion.proyecto.name === filtroProyecto) &&
    (filtroPartida === 'todas' || licitacion.partida === filtroPartida)
  )

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Licitaciones</h1>
      <div className="flex space-x-4 mb-4">
        <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los proyectos</SelectItem>
            {proyectos.map(proyecto => (
              <SelectItem key={proyecto} value={proyecto}>{proyecto}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroPartida} onValueChange={setFiltroPartida}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por partida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las partidas</SelectItem>
            {partidas.map(partida => (
              <SelectItem key={partida} value={partida}>{partida}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {licitacionesFiltradas.map((licitacion) => (
          <Card key={licitacion.id}>
            <CardHeader>
              <CardTitle>{licitacion.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Proyecto:</strong> {licitacion.proyecto.name}</p>
              <p><strong>Partida:</strong> {licitacion.partida}</p>
              <p><strong>Cotizaciones recibidas:</strong> {licitacion.cotizaciones}</p>
              <div className="mt-4 space-x-2">
                <Button onClick={() => router.push(`/constructora/licitaciones/${licitacion.id}/cotizaciones`)}>Ver cotizaciones</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
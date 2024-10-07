'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye } from 'lucide-react'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import { specializations } from '@/utils/specializations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Licitacion {
  id: number
  description: string
  partida: string
  publication_end_date: string
  active: boolean
  project_id: number
  project: {
    id: number
    name: string
  }
}

interface Project {
  id: number
  name: string
}

type FilterStatus = 'all' | 'active' | 'inactive'

interface LicitacionesListProps {
  initialLicitaciones: Licitacion[]
  projects: Project[]
  selectedProjectId: string
}

export default function LicitacionesList({ initialLicitaciones, projects, selectedProjectId }: LicitacionesListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>(initialLicitaciones)
  const [filteredLicitaciones, setFilteredLicitaciones] = useState<Licitacion[]>(initialLicitaciones)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>(selectedProjectId)
  const [selectedPartidas, setSelectedPartidas] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  console.log("licitaciones", licitaciones)
  console.log("projects", projects)

  useEffect(() => {
    const now = new Date()
    const filtered = licitaciones.filter(licitacion => {
      const isActive = licitacion.active && new Date(licitacion.publication_end_date) > now
      const matchesPartida = selectedPartidas.length === 0 || selectedPartidas.includes(licitacion.partida)
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'active' && isActive) ||
        (filterStatus === 'inactive' && !isActive)
      
      return (selectedProject === 'all' || licitacion.project_id?.toString() === selectedProject) &&
             matchesPartida && matchesStatus
    })
    setFilteredLicitaciones(filtered)
  }, [selectedProject, selectedPartidas, licitaciones, filterStatus])

  const handleProjectChange = (value: string) => {
    setSelectedProject(value)
    if (value !== 'all') {
      router.push(`/constructora/proyectos/${value}/licitaciones`)
    } else {
      router.push('/constructora/proyectos/all/licitaciones')
    }
  }

  const handlePartidasChange = (selected: string[]) => {
    setSelectedPartidas(selected)
  }

  const handleStatusChange = (value: FilterStatus) => {
    setFilterStatus(value)
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
      <h1 className="text-2xl font-bold mb-4">Licitaciones {selectedProject === 'all' ? 'de Todos los Proyectos' : 'del Proyecto'}</h1>
      
      <div className="mb-4 space-y-4">
        <div>
          <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Proyecto
          </label>
          <Select onValueChange={handleProjectChange} value={selectedProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="partidas-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Partidas
          </label>
          <MultiSelectDropdown
            options={specializations}
            selectedOptions={selectedPartidas}
            onChange={handlePartidasChange}
          />
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Estado de Licitaciones
          </label>
          <Select onValueChange={handleStatusChange} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredLicitaciones.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detalle del Requerimiento</TableHead>
                <TableHead>Partida</TableHead>
                <TableHead>Fecha de Cierre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicitaciones.map((licitacion) => (
                <TableRow key={licitacion.id}>
                  <TableCell>{licitacion.description}</TableCell>
                  <TableCell>{licitacion.partida}</TableCell>
                  <TableCell>{new Date(licitacion.publication_end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{licitacion.active ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>{licitacion.project.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/constructora/proyectos/${licitacion.project_id}/licitaciones/${licitacion.id}/ver-detalle`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/constructora/proyectos/${licitacion.project_id}/licitaciones/${licitacion.id}/cotizaciones`}>
                        <Button variant="outline" size="sm">Cotizaciones</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center py-4">No hay licitaciones para {selectedProject === 'all' ? 'ningún proyecto' : 'este proyecto'}.</p>
      )}
      <div className="mt-4">
        <Link href={`/constructora/proyectos/${selectedProject === 'all' ? 'new' : selectedProject}/crear-licitacion`}>
          <Button>Crear Licitación</Button>
        </Link>
      </div>
    </div>
  )
}
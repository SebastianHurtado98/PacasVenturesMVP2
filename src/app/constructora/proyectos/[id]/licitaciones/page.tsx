'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Hardcoded data for licitaciones
const licitaciones = [
  { id: 1, nombre: 'Instalación Eléctrica', partida: 'Electricidad', fechaCierre: '2024-05-15', estado: 'Activo' },
  { id: 2, nombre: 'Acabados de Interiores', partida: 'Acabados', fechaCierre: '2024-06-30', estado: 'Activo' },
  { id: 3, nombre: 'Sistema de Climatización', partida: 'HVAC', fechaCierre: '2024-07-15', estado: 'Inactivo' },
]

export default function LicitacionesProyecto() {
  const { id } = useParams()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Licitaciones del Proyecto {id}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Partida</TableHead>
            <TableHead>Fecha de Cierre</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licitaciones.map((licitacion) => (
            <TableRow key={licitacion.id}>
              <TableCell>{licitacion.nombre}</TableCell>
              <TableCell>{licitacion.partida}</TableCell>
              <TableCell>{licitacion.fechaCierre}</TableCell>
              <TableCell>{licitacion.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Link href={`/constructora/proyectos/${id}/crear-licitacion`}>
          <Button>Crear Licitación</Button>
        </Link>
      </div>
    </div>
  )
}
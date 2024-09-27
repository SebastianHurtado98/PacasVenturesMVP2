'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CrearLicitacion() {
  const { id } = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fechaCierre: '',
    estado: 'Activo',
    nombreProyecto: '',
    nombreConstructora: '',
    partida: '',
    ubicacion: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaInicioTrabajo: '',
    detalleRequerimiento: '',
    documentosAdicionales: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    router.push('/constructora/licitaciones')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Licitación para Proyecto {id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fechaCierre">Fecha de cierre</Label>
          <Input
            id="fechaCierre"
            name="fechaCierre"
            type="date"
            value={formData.fechaCierre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="nombreProyecto">Nombre del proyecto</Label>
          <Input
            id="nombreProyecto"
            name="nombreProyecto"
            value={formData.nombreProyecto}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="nombreConstructora">Nombre Constructora</Label>
          <Input
            id="nombreConstructora"
            name="nombreConstructora"
            value={formData.nombreConstructora}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="partida">Partida</Label>
          <Input
            id="partida"
            name="partida"
            value={formData.partida}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="ubicacion">Ubicación</Label>
          <Input
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="fechaInicioTrabajo">Fecha de inicio del trabajo</Label>
          <Input
            id="fechaInicioTrabajo"
            name="fechaInicioTrabajo"
            type="date"
            value={formData.fechaInicioTrabajo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="detalleRequerimiento">Detalle del requerimiento</Label>
          <Textarea
            id="detalleRequerimiento"
            name="detalleRequerimiento"
            value={formData.detalleRequerimiento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="documentosAdicionales">Documentos adicionales (adjuntos o enlaces)</Label>
          <Input
            id="documentosAdicionales"
            name="documentosAdicionales"
            value={formData.documentosAdicionales}
            onChange={handleChange}
          />
        </div>
        <Button type="submit">Crear Licitación</Button>
      </form>
    </div>
  )
}
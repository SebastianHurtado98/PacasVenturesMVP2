'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CrearProyecto() {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    // For now, we'll just simulate a successful creation
    console.log({ nombre, direccion, ciudad, departamento, descripcion })
    router.push('/constructora/proyectos')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Proyecto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre del proyecto</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input
            id="ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="departamento">Departamento</Label>
          <Input
            id="departamento"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Información como dimensiones, número de etapas, tipo de inmuebles, etc."
            required
          />
        </div>
        <Button type="submit">Crear Proyecto</Button>
      </form>
    </div>
  )
}
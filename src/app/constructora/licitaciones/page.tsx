'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Hardcoded data for licitaciones
const licitaciones = [
  { id: 1, nombre: 'Instalación Eléctrica', proyecto: 'Edificio Residencial Aurora', partida: 'Electricidad', cotizaciones: 3 },
  { id: 2, nombre: 'Acabados de Interiores', proyecto: 'Centro Comercial Pacífico', partida: 'Acabados', cotizaciones: 5 },
  { id: 3, nombre: 'Sistema de Climatización', proyecto: 'Condominio Eco Verde', partida: 'HVAC', cotizaciones: 2 },
]

export default function Licitaciones() {
  const [filtroProyecto, setFiltroProyecto] = useState('todos')
  const [filtroPartida, setFiltroPartida] = useState('todas')

  const licitacionesFiltradas = licitaciones.filter(licitacion => 
    (filtroProyecto === 'todos' || licitacion.proyecto === filtroProyecto) &&
    (filtroPartida === 'todas' || licitacion.partida === filtroPartida)
  )

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
            <SelectItem value="Edificio Residencial Aurora">Edificio Residencial Aurora</SelectItem>
            <SelectItem value="Centro Comercial Pacífico">Centro Comercial Pacífico</SelectItem>
            <SelectItem value="Condominio Eco Verde">Condominio Eco Verde</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPartida} onValueChange={setFiltroPartida}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por partida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las partidas</SelectItem>
            <SelectItem value="Electricidad">Electricidad</SelectItem>
            <SelectItem value="Acabados">Acabados</SelectItem>
            <SelectItem value="HVAC">HVAC</SelectItem>
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
              <p><strong>Proyecto:</strong> {licitacion.proyecto}</p>
              <p><strong>Partida:</strong> {licitacion.partida}</p>
              <p><strong>Cotizaciones recibidas:</strong> {licitacion.cotizaciones}</p>
              <div className="mt-4 space-x-2">
                <Button variant="outline">Ver cotizaciones</Button>
                <Button>Calificar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
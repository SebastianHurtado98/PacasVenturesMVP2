'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Hardcoded data for projects
const projects = [
  { id: 1, name: 'Edificio Residencial Aurora', location: 'Lima', description: 'Complejo de apartamentos de lujo en el corazón de Miraflores.' },
  { id: 2, name: 'Centro Comercial Pacífico', location: 'Trujillo', description: 'Moderno centro comercial con más de 100 tiendas y un food court.' },
  { id: 3, name: 'Condominio Eco Verde', location: 'Arequipa', description: 'Proyecto residencial sostenible con amplias áreas verdes.' },
]

export default function Proyectos() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proyectos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Ubicación:</strong> {project.location}</p>
              <p>{project.description}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/constructora/proyectos/${project.id}/licitaciones`}>
                <Button>Ver licitaciones</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/constructora/proyectos/crear-proyecto">
          <Button>Crear Nuevo Proyecto</Button>
        </Link>
      </div>
    </div>
  )
}
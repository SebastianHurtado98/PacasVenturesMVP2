'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Eye } from 'lucide-react'

interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
}

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        // First, fetch the user's ID from the custom 'user' table
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (userError) throw userError

        if (!userData) {
          throw new Error('User not found in the custom user table')
        }

        // Now fetch the projects using the custom user ID
        const { data: projectsData, error: projectsError } = await supabase
          .from('project')
          .select('*')
          .eq('user_id', userData.id)

        if (projectsError) throw projectsError

        setProjects(projectsData || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los proyectos. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [supabase, user, toast])

  if (isLoading) {
    return <div className="text-center py-10">Cargando proyectos...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proyectos</h1>
      {projects.length === 0 ? (
        <p className="text-center py-10">No tienes proyectos creados aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Dirección:</strong> {project.location}</p>
                <p>{project.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/constructora/proyectos/${project.id}/ver-detalle`}>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                </Link>
                <Link href={`/constructora/proyectos/${project.id}/licitaciones`}>
                  <Button>Ver licitaciones</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Link href="/constructora/proyectos/crear-proyecto">
          <Button>Crear Nuevo Proyecto</Button>
        </Link>
      </div>
      <Toaster />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, Edit } from 'lucide-react'

interface Project {
  id: number
  name: string
  location: string
  city: string
  department: string
  description: string
}

export default function ProyectoDetalle() {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (userError) throw userError

        if (!userData) {
          throw new Error('User not found in the custom user table')
        }

        const { data: projectData, error: projectError } = await supabase
          .from('project')
          .select('*')
          .eq('id', id)
          .eq('user_id', userData.id)
          .single()

        if (projectError) throw projectError

        setProject(projectData)
      } catch (error) {
        console.error('Error fetching project:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar el proyecto. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id, supabase, user, router, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return <div className="text-center py-10">No se encontró el proyecto</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Dirección</p>
              <p className="font-semibold">{project.location}</p>
            </div>
            <div>
              <p className="text-gray-600">Ciudad</p>
              <p className="font-semibold">{project.city}</p>
            </div>
            <div>
              <p className="text-gray-600">Departamento</p>
              <p className="font-semibold">{project.department}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Descripción</p>
            <p className="mt-2">{project.description}</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button onClick={() => router.push('/constructora/proyectos')}>Volver</Button>
        <Link href={`/constructora/proyectos/${id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Proyecto
          </Button>
        </Link>
      </div>
      <Toaster />
    </div>
  )
}
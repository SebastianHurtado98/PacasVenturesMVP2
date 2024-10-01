'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

interface Project {
  id: number
  name: string
  location: string
  city: string
  department: string
  description: string
}

export default function EditarProyecto() {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { user } = useAuth()

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProject(prev => prev ? ({ ...prev, [name]: value }) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    try {
      const { error } = await supabase
        .from('project')
        .update(project)
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Proyecto actualizado",
        description: "El proyecto se ha actualizado exitosamente.",
      })

      router.push(`/constructora/proyectos/${id}/ver-detalle`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

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
      <h1 className="text-2xl font-bold mb-4">Editar Proyecto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Proyecto/obra</Label>
          <Input
            id="name"
            name="name"
            value={project.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Dirección</Label>
          <Input
            id="location"
            name="location"
            value={project.location}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            name="city"
            value={project.city}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            name="department"
            value={project.department}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={project.description}
            onChange={handleChange}
            placeholder="Información como dimensiones, número de etapas, tipo de inmuebles, etc."
            required
          />
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit">Actualizar Proyecto</Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
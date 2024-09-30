'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/AuthProvider'

export default function CrearProyecto() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un proyecto.",
        variant: "destructive",
      })
      return
    }

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

      // Now create the project with the custom user ID
      const { data, error } = await supabase
        .from('project')
        .insert({
          name,
          location,
          city,
          department,
          description,
          user_id: userData.id // Use the ID from the custom user table
        })
        .single()

      if (error) throw error

      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente.",
      })

      router.push('/constructora/proyectos')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Proyecto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Proyecto/obra</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Dirección</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Información como dimensiones, número de etapas, tipo de inmuebles, etc."
            required
          />
        </div>
        <Button type="submit">Crear Proyecto</Button>
      </form>
      <Toaster />
    </div>
  )
}
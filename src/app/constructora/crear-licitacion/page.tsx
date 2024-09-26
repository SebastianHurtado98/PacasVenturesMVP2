'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/AuthProvider'
import { useSupabase } from '@/components/supabase-provider'

export default function CrearLicitacion() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fechaCierre: '',
    partida: '',
    lugar: '',
    presupuestoInicial: '',
    especificacionesTecnicas: '',
    fechaInicioTrabajo: '',
    informacionAdicional: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      toast({
        title: "No has iniciado sesión",
        description: "Debes iniciar sesión para crear una licitación.",
        variant: "destructive",
      })
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [user, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, partida: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una licitación.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      let file_id = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('bid_files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('bid_files')
          .getPublicUrl(filePath)

        if (!publicUrlData) throw new Error('Failed to get public URL')

        const { data: fileData, error: fileError } = await supabase
          .from('bid_doc')
          .insert({
            file_name: file.name,
            file_path: publicUrlData.publicUrl,
          })
          .select()

        if (fileError) throw fileError

        file_id = fileData[0].id
      }

      const { error: bidError } = await supabase
        .from('bid')
        .insert([
          {
            user_id: user.id,
            active: true,
            partida: formData.partida,
            publication_end_date: formData.fechaCierre,
            location: formData.lugar,
            initial_budget: formData.presupuestoInicial,
            job_technical_specs: formData.especificacionesTecnicas,
            job_start_date: formData.fechaInicioTrabajo,
            job_details: formData.informacionAdicional,
            file_id: file_id,
          }
        ])

      if (bidError) throw bidError

      toast({
        title: "Licitación creada",
        description: "La licitación se ha creado correctamente.",
      })
      router.push('/constructora')
    } catch (error) {
      console.error('Error al crear la licitación:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la licitación. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Crear Licitación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fechaCierre" className="block text-sm font-medium text-gray-700">
            Fecha de cierre de licitación
          </label>
          <Input
            type="date"
            id="fechaCierre"
            name="fechaCierre"
            required
            value={formData.fechaCierre}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="partida" className="block text-sm font-medium text-gray-700">
            Partida
          </label>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una partida" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electricidad">Electricidad</SelectItem>
              <SelectItem value="plomeria">Plomería</SelectItem>
              <SelectItem value="carpinteria">Carpintería</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">
            Lugar
          </label>
          <Input
            type="text"
            id="lugar"
            name="lugar"
            required
            value={formData.lugar}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="presupuestoInicial" className="block text-sm font-medium text-gray-700">
            Presupuesto inicial (opcional)
          </label>
          <Input
            type="number"
            id="presupuestoInicial"
            name="presupuestoInicial"
            value={formData.presupuestoInicial}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="especificacionesTecnicas" className="block text-sm font-medium text-gray-700">
            Especificaciones técnicas
          </label>
          <Textarea
            id="especificacionesTecnicas"
            name="especificacionesTecnicas"
            rows={4}
            required
            value={formData.especificacionesTecnicas}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="fechaInicioTrabajo" className="block text-sm font-medium text-gray-700">
            Fecha de inicio de trabajo
          </label>
          <Input
            type="date"
            id="fechaInicioTrabajo"
            name="fechaInicioTrabajo"
            required
            value={formData.fechaInicioTrabajo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="informacionAdicional" className="block text-sm font-medium text-gray-700">
            Información adicional
          </label>
          <Textarea
            id="informacionAdicional"
            name="informacionAdicional"
            rows={4}
            value={formData.informacionAdicional}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
            Adjuntar documento
          </label>
          <Input
            type="file"
            id="documento"
            name="documento"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Licitación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
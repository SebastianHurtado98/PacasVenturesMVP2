'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from '@/components/supabase-provider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PlusIcon, XIcon } from 'lucide-react'
import { specializations } from '@/utils/specializations'
import SingleSelectDropdown from '@/components/SingleSelectDropdown'

export default function CrearLicitacion() {
  const { id: project_id } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    publication_end_date: '',
    job_start_date: '',
    active: true,
    partida: '',
    description: '',
  })

  const [userId, setUserId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [links, setLinks] = useState<{ url: string; name: string }[]>([])
  const [newLink, setNewLink] = useState({ url: '', name: '' })

  useEffect(() => {
    const fetchUserId = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user ID:', error)
          toast({
            title: "Error",
            description: "No se pudo obtener la información del usuario.",
            variant: "destructive",
          })
        } else if (data) {
          setUserId(data.id)
        }
      }
    }

    fetchUserId()
  }, [user, supabase, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePartidaChange = (selected: string) => {
    setFormData(prev => ({ ...prev, partida: selected }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files || [])])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleAddLink = () => {
    if (newLink.url && newLink.name) {
      setLinks(prevLinks => [...prevLinks, newLink])
      setNewLink({ url: '', name: '' })
    }
  }

  const removeLink = (index: number) => {
    setLinks(prevLinks => prevLinks.filter((_, i) => i !== index))
  }

  const validateDates = () => {
    const publicationEndDate = new Date(formData.publication_end_date)
    const jobStartDate = new Date(formData.job_start_date)

    if (publicationEndDate > jobStartDate) {
      toast({
        title: "Error de fecha",
        description: "La fecha de cierre no puede ser posterior a la fecha de inicio del trabajo.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una licitación.",
        variant: "destructive",
      })
      return
    }

    if (!validateDates()) {
      return
    }

    try {
      const { data, error } = await supabase
      .from('bid')
      .insert({
        ...formData,
        project_id,
        user_id: userId,
      })
      .select('id')
      .single()

      if (error) throw error

      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bid_files')
          .upload(`uploads/${fileName}`, file)

        if (uploadError) throw uploadError

        const { error: docError } = await supabase
          .from('bid_doc')
          .insert({
            bid_id: data.id,
            file_name: file.name,
            file_path: uploadData.path
          })

        if (docError) throw docError
      }

      for (const link of links) {
        const { error: linkError } = await supabase
          .from('bid_link')
          .insert({
            bid_id: data.id,
            link: link.url,
            link_name: link.name
          })

        if (linkError) throw linkError
      }

      toast({
        title: "Licitación creada",
        description: "La licitación se ha creado exitosamente.",
      })

      router.push(`/constructora/proyectos/${project_id}/licitaciones`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la licitación. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Licitación para Proyecto {project_id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="job_start_date">Fecha de inicio del trabajo</Label>
          <Input
            id="job_start_date"
            name="job_start_date"
            type="date"
            value={formData.job_start_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="publication_end_date">Fecha de cierre</Label>
          <Input
            id="publication_end_date"
            name="publication_end_date"
            type="date"
            value={formData.publication_end_date}
            onChange={handleChange}
            max={formData.job_start_date || undefined}
            required
          />
        </div>
        <div>
          <Label htmlFor="active">Estado</Label>
          <Select 
            name="active" 
            onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === 'true' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="partida">Partida</Label>
          <SingleSelectDropdown
            options={specializations}
            selectedOption={formData.partida}
            onChange={handlePartidaChange}
          />
        </div>
        <div>
          <Label htmlFor="description">Detalle del requerimiento</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="files">Archivos adjuntos</Label>
          <div className="mt-1 flex items-center">
            <Input
              id="files"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <Label
              htmlFor="files"
              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Agregar archivo
            </Label>
          </div>
          <div className="mt-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                <span className="text-sm text-gray-600">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="link-url">Agregar enlace</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="link-url"
              type="url"
              placeholder="URL del enlace"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
            />
            <Input
              id="link-name"
              type="text"
              placeholder="Nombre del enlace"
              value={newLink.name}
              onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
            />
            <Button type="button" onClick={handleAddLink}>Agregar</Button>
          </div>
          <div className="mt-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{link.name}</a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(index)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button type="submit">Crear Licitación</Button>
      </form>
      <Toaster />
    </div>
  )
}
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
import { PlusIcon, XIcon, Loader2 } from 'lucide-react'
import { specializations } from '@/utils/specializations'
import SingleSelectDropdown from '@/components/SingleSelectDropdown'

interface Licitacion {
  id: number
  active: boolean
  partida: string
  publication_end_date: string
  job_start_date: string
  description: string
  project_id: number
}

interface FileInfo {
  id: number
  file_name: string
  file_path: string
  bid_id: number
}

interface LinkInfo {
  id: number
  link: string
  link_name: string
  bid_id: number
}

export default function EditarLicitacion() {
  const { id: project_id, licitacionId } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Licitacion | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<FileInfo[]>([])
  const [links, setLinks] = useState<LinkInfo[]>([])
  const [newLink, setNewLink] = useState({ url: '', name: '' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLicitacionData = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('bid')
          .select('*')
          .eq('id', licitacionId)
          .single()

        if (error) throw error

        setFormData(data)

        // Fetch existing files
        const { data: filesData, error: filesError } = await supabase
          .from('bid_doc')
          .select('*')
          .eq('bid_id', licitacionId)

        if (filesError) throw filesError
        setExistingFiles(filesData || [])

        // Fetch existing links
        const { data: linksData, error: linksError } = await supabase
          .from('bid_link')
          .select('*')
          .eq('bid_id', licitacionId)

        if (linksError) throw linksError
        setLinks(linksData || [])

      } catch (error) {
        console.error('Error fetching licitacion data:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la licitación.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicitacionData()
  }, [user, supabase, licitacionId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null)
  }

  const handlePartidaChange = (selected: string) => {
    setFormData(prev => prev ? ({ ...prev, partida: selected }) : null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files || [])])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const removeExistingFile = async (fileId: number) => {
    try {
      const { error } = await supabase
        .from('bid_doc')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      setExistingFiles(prevFiles => prevFiles.filter(file => file.id !== fileId))
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error('Error removing file:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleAddLink = () => {
    if (newLink.url && newLink.name) {
      setLinks(prevLinks => [...prevLinks, { id: Date.now(), link: newLink.url, link_name: newLink.name, bid_id: Number(licitacionId) }])
      setNewLink({ url: '', name: '' })
    }
  }

  const removeLink = async (linkId: number) => {
    try {
      if (linkId > 0) {
        const { error } = await supabase
          .from('bid_link')
          .delete()
          .eq('id', linkId)

        if (error) throw error
      }

      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId))
      toast({
        title: "Enlace eliminado",
        description: "El enlace se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error('Error removing link:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el enlace. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const validateDates = () => {
    if (!formData) return false
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
    if (!formData) return

    if (!validateDates()) {
      return
    }

    try {
      const { error } = await supabase
        .from('bid')
        .update(formData)
        .eq('id', licitacionId)

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
            bid_id: licitacionId,
            file_name: file.name,
            file_path: uploadData.path
          })

        if (docError) throw docError
      }

      for (const link of links) {
        if (link.id > 0) continue // Skip existing links

        const { error: linkError } = await supabase
          .from('bid_link')
          .insert({
            bid_id: licitacionId,
            link: link.link,
            link_name: link.link_name
          })

        if (linkError) throw linkError
      }

      toast({
        title: "Licitación actualizada",
        description: "La licitación se ha actualizado exitosamente.",
      })

      router.push(`/constructora/proyectos/${project_id}/licitaciones/${licitacionId}/ver-detalle/`)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la licitación. Por favor, intenta de nuevo.",
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

  if (!formData) return <div className="text-center py-10">No se encontró la licitación</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Licitación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="job_start_date">Fecha de inicio del trabajo</Label>
          <Input
            id="job_start_date"
            name="job_start_date"
            type="date"
            value={formData.job_start_date}
            onChange={handleChange}
            required
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
            required
          />
        </div>
        <div>
          <Label htmlFor="active">Estado</Label>
          <Select 
            name="active" 
            onValueChange={(value) => setFormData(prev => prev ? ({ ...prev, active: value === 'true' }) : null)}
            value={formData.active.toString()}
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
            {existingFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                <span className="text-sm text-gray-600">{file.file_name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExistingFile(file.id)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{link.link_name}</a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(link.id)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push('/constructora/proyectos')}>Cancelar</Button>
          <Button type="submit">Actualizar Licitación</Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
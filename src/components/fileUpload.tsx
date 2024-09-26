'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type FileUploadProps = {
  bucketName: string;
  tableName: string;
  onUploadComplete?: (filePath: string) => void;
}

export default function FileUpload({ bucketName, tableName, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // 1. Subir el archivo a Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (uploadError) {
        throw new Error('Error al subir el archivo')
      }

      // 2. Construir la URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData?.publicUrl || ''

      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública del archivo')
      }

      // 3. Guardar la referencia en la base de datos
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({
          name: file.name,
          file_path: publicUrl,
          file_name: fileName
        })

      if (insertError) {
        throw new Error('Error al guardar la referencia del archivo en la base de datos')
      }

      toast({
        title: "Éxito",
        description: "Archivo subido y registrado correctamente",
      })

      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al subir el archivo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input 
        type="file" 
        onChange={handleFileChange} 
        disabled={uploading}
      />
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? 'Subiendo...' : 'Subir Archivo'}
      </Button>
    </div>
  )
}
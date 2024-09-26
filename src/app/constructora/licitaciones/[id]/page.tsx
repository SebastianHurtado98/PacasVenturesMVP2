import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface Licitacion {
  id: number;
  active: boolean;
  partida: string;
  publication_end_date: string;
  location: string;
  initial_budget: number;
  job_technical_specs: string;
  job_start_date: string;
  job_details: string;
  file_id: number | null;
}

interface BidDoc {
  id: number;
  file_name: string;
  file_path: string;
}

async function getLicitacion(id: string): Promise<Licitacion | null> {
  const supabase = createServerComponentClient({ cookies })
  
  console.log(`Fetching licitacion with id: ${id}`)
  const { data, error } = await supabase
    .from('bid')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching licitacion:', error)
    return null
  }

  console.log('Licitacion data:', data)
  return data
}

async function getFileInfo(fileId: number): Promise<BidDoc | null> {
  const supabase = createServerComponentClient({ cookies })
  
  console.log(`Fetching file info for file_id: ${fileId}`)
  const { data, error } = await supabase
    .from('bid_doc')
    .select('*')
    .eq('id', fileId)
    .single()

  if (error) {
    console.error('Error fetching file info:', error)
    return null
  }

  console.log('File info:', data)
  return data
}

async function getSignedUrl(filePath: string): Promise<string | null> {
  const supabase = createServerComponentClient({ cookies })
  
  // Extract the file path from the public URL
  const storageFilePath = filePath.split('/').slice(-2).join('/')
  console.log(`Creating signed URL for file path: ${storageFilePath}`)
  
  const { data, error } = await supabase
    .storage
    .from('bid_files')
    .createSignedUrl(storageFilePath, 60) // URL válida por 60 segundos

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  console.log('Signed URL created:', data.signedUrl)
  return data.signedUrl
}

export default async function LicitacionDetalle({ params }: { params: { id: string } }) {
  console.log('Rendering LicitacionDetalle for id:', params.id)

  const licitacion = await getLicitacion(params.id);

  if (!licitacion) {
    console.log('Licitacion not found, redirecting to 404')
    notFound();
  }

  console.log('Licitacion found:', licitacion)

  let fileInfo = null;
  let signedUrl = null;
  if (licitacion.file_id) {
    console.log(`Licitacion has file_id: ${licitacion.file_id}, fetching file info`)
    fileInfo = await getFileInfo(licitacion.file_id);
    if (fileInfo) {
      console.log('File info found, creating signed URL')
      signedUrl = await getSignedUrl(fileInfo.file_path);
    } else {
      console.log('File info not found')
    }
  } else {
    console.log('Licitacion does not have a file_id')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalle de Licitación</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold">{licitacion.active ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div>
            <p className="text-gray-600">Partida</p>
            <p className="font-semibold">{licitacion.partida}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de cierre</p>
            <p className="font-semibold">{new Date(licitacion.publication_end_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Lugar</p>
            <p className="font-semibold">{licitacion.location}</p>
          </div>
          <div>
            <p className="text-gray-600">Presupuesto inicial</p>
            <p className="font-semibold">${licitacion.initial_budget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de inicio de trabajo</p>
            <p className="font-semibold">{new Date(licitacion.job_start_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Especificaciones técnicas</p>
          <p className="mt-2">{licitacion.job_technical_specs}</p>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Información adicional</p>
          <p className="mt-2">{licitacion.job_details}</p>
        </div>
        {fileInfo && (
          <div className="mt-6">
            <p className="text-gray-600">Documento adjunto</p>
            {signedUrl ? (
              <Button asChild className="mt-2">
                <a href={signedUrl} download={fileInfo.file_name}>
                  Descargar {fileInfo.file_name}
                </a>
              </Button>
            ) : (
              <p className="mt-2 text-red-500">Error al generar el enlace de descarga</p>
            )}
          </div>
        )}
        {licitacion.file_id && !fileInfo && (
          <div className="mt-6">
            <p className="text-red-500">Error al obtener la información del archivo</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <Button asChild>
          <Link href={`/constructora/licitaciones/cotizaciones/${licitacion.id}`}>
            Ver cotizaciones
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/constructora">
            Volver al dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
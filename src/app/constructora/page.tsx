import Link from 'next/link'
import { Button } from "@/components/ui/button"
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
}

async function getLicitaciones(): Promise<Licitacion[]> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('bid')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching licitaciones:', error)
    return []
  }

  return data || []
}

export default async function ConstructoraDashboard() {
  const licitaciones = await getLicitaciones();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Constructora</h1>
      <Button asChild className="mb-8">
        <Link href="/constructora/crear-licitacion">
          Crear Licitación
        </Link>
      </Button>
      <h2 className="text-2xl font-semibold mb-4">Licitaciones Creadas</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partida</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de cierre</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {licitaciones.map((licitacion) => (
              <tr key={licitacion.id}>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${licitacion.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {licitacion.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">{licitacion.partida}</td>
                <td className="py-4 px-4 whitespace-nowrap">{licitacion.location}</td>
                <td className="py-4 px-4 whitespace-nowrap">{new Date(licitacion.publication_end_date).toLocaleDateString()}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/constructora/licitaciones/${licitacion.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Ver detalle
                  </Link>
                  <Link href={`/constructora/licitaciones/cotizaciones/${licitacion.id}`} className="text-green-600 hover:text-green-900">
                    Ver cotizaciones
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
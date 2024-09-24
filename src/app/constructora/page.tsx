import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface Licitacion {
  id: number;
  status: string;
  nombre: string;
  partida: string;
}

async function getLicitaciones(): Promise<Licitacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  return [
    { id: 1, status: 'Activo', nombre: 'Proyecto A', partida: 'Electricidad' },
    { id: 2, status: 'Inactivo', nombre: 'Proyecto B', partida: 'Plomería' },
  ];
}

export default async function ConstructoraDashboard() {
  const licitaciones = await getLicitaciones();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard de Constructora</h1>
      <Button asChild>
        <Link href="/constructora/crear-licitacion">
          Crear Licitación
        </Link>
      </Button>
      <h2 className="text-xl font-semibold mt-8 mb-4">Licitaciones Creadas</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Nombre del proyecto</th>
              <th className="py-2 px-4 border-b">Partida</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {licitaciones.map((licitacion) => (
              <tr key={licitacion.id}>
                <td className="py-2 px-4 border-b">{licitacion.status}</td>
                <td className="py-2 px-4 border-b">{licitacion.nombre}</td>
                <td className="py-2 px-4 border-b">{licitacion.partida}</td>
                <td className="py-2 px-4 border-b">
                  <Link href={`/constructora/licitaciones/${licitacion.id}`} className="text-blue-500 hover:text-blue-700 mr-2">
                    Ver detalle
                  </Link>
                  <Link href={`/constructora/licitaciones/cotizaciones/${licitacion.id}`} className="text-green-500 hover:text-green-700">
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
import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Cotizacion {
  id: number;
  proveedorNombre: string;
  propuestaEconomica: number;
  fechaPresentacion: string;
}

async function getCotizaciones(licitacionId: string): Promise<Cotizacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  const cotizaciones: Cotizacion[] = [
    {
      id: 1,
      proveedorNombre: "Proveedor A",
      propuestaEconomica: 95000,
      fechaPresentacion: "2023-11-15"
    },
    {
      id: 2,
      proveedorNombre: "Proveedor B",
      propuestaEconomica: 98000,
      fechaPresentacion: "2023-11-16"
    },
    // Añade más cotizaciones de ejemplo si lo deseas
  ];

  return cotizaciones;
}

export default async function CotizacionesLicitacion({ params }: { params: { id: string } }) {
  const cotizaciones = await getCotizaciones(params.id);

  if (cotizaciones.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cotizaciones para Licitación #{params.id}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propuesta Económica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Presentación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cotizaciones.map((cotizacion) => (
              <tr key={cotizacion.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.proveedorNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">${cotizacion.propuestaEconomica.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.fechaPresentacion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm">Evaluar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href={`/constructora/licitaciones/${params.id}`}>
            Volver a detalles de licitación
          </Link>
        </Button>
      </div>
    </div>
  )
}
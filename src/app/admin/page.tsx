import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface Cotizacion {
  id: number;
  proveedorNombre: string;
  licitacionNombre: string;
  constructoraNombre: string;
  fechaEnvio: string;
  monto: number;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

async function getCotizaciones(): Promise<Cotizacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  return [
    { id: 1, proveedorNombre: "Proveedor A", licitacionNombre: "Proyecto X", constructoraNombre: "Constructora 1", fechaEnvio: "2023-11-15", monto: 100000, estado: 'Pendiente' },
    { id: 2, proveedorNombre: "Proveedor B", licitacionNombre: "Proyecto Y", constructoraNombre: "Constructora 2", fechaEnvio: "2023-11-16", monto: 150000, estado: 'Pendiente' },
    { id: 3, proveedorNombre: "Proveedor C", licitacionNombre: "Proyecto Z", constructoraNombre: "Constructora 1", fechaEnvio: "2023-11-17", monto: 200000, estado: 'Aprobada' },
  ];
}

export default async function AdminDashboard() {
  const cotizaciones = await getCotizaciones();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard de Administrador</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licitación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constructora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Envío</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cotizaciones.map((cotizacion) => (
              <tr key={cotizacion.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.proveedorNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.licitacionNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.constructoraNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.fechaEnvio}</td>
                <td className="px-6 py-4 whitespace-nowrap">${cotizacion.monto.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cotizacion.estado === 'Aprobada' ? 'bg-green-100 text-green-800' :
                    cotizacion.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cotizacion.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button asChild size="sm">
                    <Link href={`/admin/cotizaciones/${cotizacion.id}`}>
                      Ver Detalle
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
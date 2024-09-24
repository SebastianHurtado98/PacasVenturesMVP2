'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

interface Cotizacion {
  id: number;
  licitacionNombre: string;
  constructora: string;
  fechaEnvio: string;
  monto: number;
  estado: 'Enviada' | 'Aceptada' | 'Rechazada';
}

async function getCotizaciones(): Promise<Cotizacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  return [
    { id: 1, licitacionNombre: "Proyecto A", constructora: "Constructora X", fechaEnvio: "2023-11-01", monto: 100000, estado: 'Enviada' },
    { id: 2, licitacionNombre: "Proyecto B", constructora: "Constructora Y", fechaEnvio: "2023-10-15", monto: 150000, estado: 'Aceptada' },
    { id: 3, licitacionNombre: "Proyecto C", constructora: "Constructora Z", fechaEnvio: "2023-09-30", monto: 200000, estado: 'Rechazada' },
  ];
}

export default function MisCotizaciones() {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCotizaciones() {
      try {
        const data = await getCotizaciones();
        setCotizaciones(data);
      } catch (error) {
        console.error('Error fetching cotizaciones:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCotizaciones();
  }, []);

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis Cotizaciones</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
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
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.licitacionNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.constructora}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.fechaEnvio}</td>
                <td className="px-6 py-4 whitespace-nowrap">${cotizacion.monto.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cotizacion.estado === 'Aceptada' ? 'bg-green-100 text-green-800' :
                    cotizacion.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cotizacion.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" onClick={() => router.push(`/proveedor/cotizaciones/${cotizacion.id}`)}>
                    Ver Detalles
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
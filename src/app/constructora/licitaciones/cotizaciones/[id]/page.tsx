'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Cotizacion {
  id: number;
  proveedorNombre: string;
  subcontratistaNombre: string;
  propuestaEconomica: number;
  fechaPresentacion: string;
  plazoEntrega: string;
  formaPago: string;
  garantia: string;
}

async function getCotizaciones(licitacionId: string): Promise<Cotizacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  const cotizaciones: Cotizacion[] = [
    {
      id: 1,
      proveedorNombre: "Proveedor A",
      subcontratistaNombre: "Subcontratista X",
      propuestaEconomica: 95000,
      fechaPresentacion: "2023-11-15",
      plazoEntrega: "3 meses",
      formaPago: "50% adelanto, 50% al finalizar",
      garantia: "1 año"
    },
    {
      id: 2,
      proveedorNombre: "Proveedor B",
      subcontratistaNombre: "Subcontratista Y",
      propuestaEconomica: 98000,
      fechaPresentacion: "2023-11-16",
      plazoEntrega: "2.5 meses",
      formaPago: "30% adelanto, 70% al finalizar",
      garantia: "2 años"
    },
    {
      id: 3,
      proveedorNombre: "Proveedor C",
      subcontratistaNombre: "Subcontratista Z",
      propuestaEconomica: 92000,
      fechaPresentacion: "2023-11-17",
      plazoEntrega: "4 meses",
      formaPago: "25% adelanto, 25% a mitad, 50% al finalizar",
      garantia: "18 meses"
    }
  ];

  return cotizaciones;
}

export default function CotizacionesLicitacion({ params }: { params: { id: string } }) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCotizaciones() {
      try {
        const data = await getCotizaciones(params.id)
        setCotizaciones(data)
      } catch (error) {
        console.error('Error fetching cotizaciones:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCotizaciones()
  }, [params.id])

  const handleEvaluar = (proveedorNombre: string) => {
    const message = encodeURIComponent(`Hola! Vi la cotización de ${proveedorNombre} para la licitación ${params.id} y quisiera obtener más información.`)
    window.open(`https://wa.me/51991124187?text=${message}`, '_blank')
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (cotizaciones.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cotizaciones para Licitación #{params.id}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcontratista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propuesta Económica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Presentación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo de Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma de Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garantía</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cotizaciones.map((cotizacion) => (
              <tr key={cotizacion.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.proveedorNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.subcontratistaNombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">${cotizacion.propuestaEconomica.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.fechaPresentacion}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.plazoEntrega}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.formaPago}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cotizacion.garantia}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" onClick={() => handleEvaluar(cotizacion.proveedorNombre)}>
                    Evaluar
                  </Button>
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
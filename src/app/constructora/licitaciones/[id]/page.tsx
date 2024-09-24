import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Licitacion {
  id: number;
  nombre: string;
  status: string;
  partida: string;
  fechaCierre: string;
  lugar: string;
  presupuestoInicial: number;
  especificacionesTecnicas: string;
  fechaInicioTrabajo: string;
  informacionAdicional: string;
}

async function getLicitacion(id: string): Promise<Licitacion | null> {
  // En una aplicación real, esto sería una llamada a una API
  const licitaciones: Licitacion[] = [
    {
      id: 1,
      nombre: "Proyecto A",
      status: "Activo",
      partida: "Electricidad",
      fechaCierre: "2023-12-31",
      lugar: "Ciudad de México",
      presupuestoInicial: 100000,
      especificacionesTecnicas: "Instalación de sistema eléctrico para edificio de 10 pisos",
      fechaInicioTrabajo: "2024-01-15",
      informacionAdicional: "Se requiere experiencia en edificios altos"
    },
    // Añade más licitaciones de ejemplo si lo deseas
  ];

  return licitaciones.find(l => l.id === parseInt(id)) || null;
}

export default async function LicitacionDetalle({ params }: { params: { id: string } }) {
  const licitacion = await getLicitacion(params.id);

  if (!licitacion) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{licitacion.nombre}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold">{licitacion.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Partida</p>
            <p className="font-semibold">{licitacion.partida}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de cierre</p>
            <p className="font-semibold">{licitacion.fechaCierre}</p>
          </div>
          <div>
            <p className="text-gray-600">Lugar</p>
            <p className="font-semibold">{licitacion.lugar}</p>
          </div>
          <div>
            <p className="text-gray-600">Presupuesto inicial</p>
            <p className="font-semibold">${licitacion.presupuestoInicial.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de inicio de trabajo</p>
            <p className="font-semibold">{licitacion.fechaInicioTrabajo}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Especificaciones técnicas</p>
          <p className="mt-2">{licitacion.especificacionesTecnicas}</p>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Información adicional</p>
          <p className="mt-2">{licitacion.informacionAdicional}</p>
        </div>
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
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface Licitacion {
  id: number;
  nombreProyecto: string;
  constructora: string;
  fechaCierre: string;
  lugar: string;
  partida: string;
  fechaInicioTrabajo: string;
}

async function getLicitacionesActivas(): Promise<Licitacion[]> {
  // En una aplicación real, esto sería una llamada a una API
  return [
    { id: 1, nombreProyecto: "Proyecto A", constructora: "Constructora X", fechaCierre: "2023-12-31", lugar: "Ciudad de México", partida: "Electricidad", fechaInicioTrabajo: "2024-01-15" },
    { id: 2, nombreProyecto: "Proyecto B", constructora: "Constructora Y", fechaCierre: "2023-12-15", lugar: "Guadalajara", partida: "Plomería", fechaInicioTrabajo: "2024-01-02" },
    { id: 3, nombreProyecto: "Proyecto C", constructora: "Constructora Z", fechaCierre: "2023-12-20", lugar: "Monterrey", partida: "Carpintería", fechaInicioTrabajo: "2024-01-10" },
  ];
}

export default async function LicitacionesActivas() {
  const licitaciones = await getLicitacionesActivas();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Licitaciones Activas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licitaciones.map((licitacion) => (
          <div key={licitacion.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{licitacion.nombreProyecto}</h2>
            <p className="text-gray-600 mb-1">Constructora: {licitacion.constructora}</p>
            <p className="text-gray-600 mb-1">Fecha de cierre: {licitacion.fechaCierre}</p>
            <p className="text-gray-600 mb-1">Lugar: {licitacion.lugar}</p>
            <p className="text-gray-600 mb-1">Partida: {licitacion.partida}</p>
            <p className="text-gray-600 mb-4">Fecha de inicio: {licitacion.fechaInicioTrabajo}</p>
            <Button asChild>
              <Link href={`/proveedor/licitaciones/${licitacion.id}`}>
                Ver Detalles
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
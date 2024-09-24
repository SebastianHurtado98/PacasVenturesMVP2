'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

interface Licitacion {
  id: number;
  nombreProyecto: string;
  constructora: string;
  fechaCierre: string;
  lugar: string;
  partida: string;
  especificacionesTecnicas: string;
  fechaInicioTrabajo: string;
}

// En una aplicación real, esta función sería una llamada a una API
const getLicitacion = async (id: string): Promise<Licitacion> => {
  // Simulamos una llamada a API con un retraso
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: parseInt(id),
    nombreProyecto: "Proyecto A",
    constructora: "Constructora X",
    fechaCierre: "2023-12-31",
    lugar: "Ciudad de México",
    partida: "Electricidad",
    especificacionesTecnicas: "Instalación de sistema eléctrico para edificio de 10 pisos...",
    fechaInicioTrabajo: "2024-01-15"
  };
};

export default function LicitacionDetalle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
  const [cotizacionPDF, setCotizacionPDF] = useState<File | null>(null);
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLicitacion = async () => {
      try {
        const data = await getLicitacion(params.id);
        setLicitacion(data);
      } catch (error) {
        console.error('Error fetching licitacion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicitacion();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCotizacionPDF(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la cotización
    console.log('Enviando cotización:', { cotizacionPDF, informacionAdicional });
    // Redirigir al usuario después de enviar la cotización
    router.push('/proveedor/cotizaciones');
  };

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;
  if (!licitacion) return <div className="text-center py-10">No se encontró la licitación</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{licitacion.nombreProyecto}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Detalles de la Licitación</h2>
        <p><strong>Constructora:</strong> {licitacion.constructora}</p>
        <p><strong>Fecha de cierre:</strong> {licitacion.fechaCierre}</p>
        <p><strong>Lugar:</strong> {licitacion.lugar}</p>
        <p><strong>Partida:</strong> {licitacion.partida}</p>
        <p><strong>Fecha de inicio de trabajo:</strong> {licitacion.fechaInicioTrabajo}</p>
        <p><strong>Especificaciones técnicas:</strong> {licitacion.especificacionesTecnicas}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Enviar Cotización</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cotizacion-pdf" className="block text-sm font-medium text-gray-700">
              Cotización en PDF
            </label>
            <input
              type="file"
              id="cotizacion-pdf"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="informacion-adicional" className="block text-sm font-medium text-gray-700">
              Información Adicional
            </label>
            <textarea
              id="informacion-adicional"
              value={informacionAdicional}
              onChange={(e) => setInformacionAdicional(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <Button type="submit">Enviar Cotización</Button>
        </form>
      </div>
    </div>
  )
}
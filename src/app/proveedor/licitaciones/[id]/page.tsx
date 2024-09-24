'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

interface Cotizacion {
  id: number;
  monto: number;
  fechaEnvio: string;
  informacionAdicional: string;
}

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

// En una aplicación real, esta función sería una llamada a una API
const getCotizaciones = async (licitacionId: string): Promise<Cotizacion[]> => {
  // Simulamos una llamada a API con un retraso
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, monto: 100000, fechaEnvio: "2023-11-15", informacionAdicional: "Incluye materiales de alta calidad" },
    { id: 2, monto: 95000, fechaEnvio: "2023-11-20", informacionAdicional: "Oferta con descuento por pronto pago" },
  ];
};

export default function LicitacionDetalle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionPDF, setCotizacionPDF] = useState<File | null>(null);
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [monto, setMonto] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCotizacionesOpen, setIsCotizacionesOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [licitacionData, cotizacionesData] = await Promise.all([
          getLicitacion(params.id),
          getCotizaciones(params.id)
        ]);
        setLicitacion(licitacionData);
        setCotizaciones(cotizacionesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCotizacionPDF(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la cotización
    console.log('Enviando cotización:', { cotizacionPDF, monto, informacionAdicional });
    // Simular el envío de la cotización
    const newCotizacion: Cotizacion = {
      id: cotizaciones.length + 1,
      monto: parseFloat(monto),
      fechaEnvio: new Date().toISOString().split('T')[0],
      informacionAdicional
    };
    setCotizaciones([...cotizaciones, newCotizacion]);
    // Limpiar el formulario
    setCotizacionPDF(null);
    setMonto('');
    setInformacionAdicional('');
  };

  const handleConsulta = () => {
    const message = encodeURIComponent(`Hola! Quisiera hacer una consulta sobre la licitación ${params.id}`);
    window.open(`https://wa.me/51991124187?text=${message}`, '_blank');
  };

  const toggleCotizaciones = () => {
    setIsCotizacionesOpen(!isCotizacionesOpen);
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
        <div className="mt-4">
          <Button onClick={handleConsulta}>Hacer consulta</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <button
          onClick={toggleCotizaciones}
          className="flex justify-between items-center w-full text-left text-xl font-semibold mb-4"
        >
          <span>Cotizaciones Enviadas ({cotizaciones.length})</span>
          {isCotizacionesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
        {isCotizacionesOpen && (
          <div className="space-y-4">
            {cotizaciones.length > 0 ? (
              cotizaciones.map((cotizacion) => (
                <div key={cotizacion.id} className="border p-4 rounded-md">
                  <p><strong>Monto:</strong> ${cotizacion.monto.toLocaleString()}</p>
                  <p><strong>Fecha de envío:</strong> {cotizacion.fechaEnvio}</p>
                  <p><strong>Información adicional:</strong> {cotizacion.informacionAdicional}</p>
                  <Button asChild className="mt-2" size="sm">
                    <Link href={`/proveedor/cotizaciones/${cotizacion.id}`}>
                      Ver Detalle
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p>No hay cotizaciones enviadas para esta licitación.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Enviar Nueva Cotización</h2>
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
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              type="number"
              id="monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
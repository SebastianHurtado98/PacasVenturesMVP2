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
  plazoEntrega: string;
  formaPago: string;
  garantia: string;
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

async function getCotizacion(id: string): Promise<{ cotizacion: Cotizacion; licitacion: Licitacion }> {
  // En una aplicación real, esto sería una llamada a una API
  await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de red
  return {
    cotizacion: {
      id: parseInt(id),
      licitacionNombre: "Proyecto A",
      constructora: "Constructora X",
      fechaEnvio: "2023-11-01",
      monto: 100000,
      estado: 'Enviada',
      plazoEntrega: "3 meses",
      formaPago: "50% adelanto, 50% al finalizar",
      garantia: "1 año"
    },
    licitacion: {
      id: 1,
      nombreProyecto: "Proyecto A",
      constructora: "Constructora X",
      fechaCierre: "2023-12-31",
      lugar: "Ciudad de México",
      partida: "Electricidad",
      especificacionesTecnicas: "Instalación de sistema eléctrico para edificio de 10 pisos...",
      fechaInicioTrabajo: "2024-01-15"
    }
  };
}

export default function DetalleCotizacion({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<{ cotizacion: Cotizacion; licitacion: Licitacion } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getCotizacion(params.id);
        setData(result);
      } catch (error) {
        console.error('Error fetching cotización details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;
  if (!data) return <div className="text-center py-10">No se encontró la cotización</div>;

  const { cotizacion, licitacion } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalle de Cotización</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Cotización</h2>
        <p><strong>Licitación:</strong> {cotizacion.licitacionNombre}</p>
        <p><strong>Constructora:</strong> {cotizacion.constructora}</p>
        <p><strong>Fecha de Envío:</strong> {cotizacion.fechaEnvio}</p>
        <p><strong>Monto:</strong> ${cotizacion.monto.toLocaleString()}</p>
        <p><strong>Estado:</strong> {cotizacion.estado}</p>
        <p><strong>Plazo de Entrega:</strong> {cotizacion.plazoEntrega}</p>
        <p><strong>Forma de Pago:</strong> {cotizacion.formaPago}</p>
        <p><strong>Garantía:</strong> {cotizacion.garantia}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Licitación</h2>
        <p><strong>Nombre del Proyecto:</strong> {licitacion.nombreProyecto}</p>
        <p><strong>Constructora:</strong> {licitacion.constructora}</p>
        <p><strong>Fecha de Cierre:</strong> {licitacion.fechaCierre}</p>
        <p><strong>Lugar:</strong> {licitacion.lugar}</p>
        <p><strong>Partida:</strong> {licitacion.partida}</p>
        <p><strong>Fecha de Inicio de Trabajo:</strong> {licitacion.fechaInicioTrabajo}</p>
        <p><strong>Especificaciones Técnicas:</strong> {licitacion.especificacionesTecnicas}</p>
      </div>

      <Button onClick={() => router.push('/proveedor/cotizaciones')}>
        Volver a Mis Cotizaciones
      </Button>
    </div>
  );
}
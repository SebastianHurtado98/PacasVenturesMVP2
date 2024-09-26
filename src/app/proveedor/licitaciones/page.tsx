'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useSupabase } from '@/components/supabase-provider'

interface Licitacion {
  id: number;
  partida: string;
  publication_end_date: string;
  location: string;
  job_start_date: string;
  active: boolean;
  initial_budget: number;
}

export default function LicitacionesActivas() {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    async function fetchLicitaciones() {
      const { data, error } = await supabase
        .from('bid')
        .select('*')
        .eq('active', true)
        .order('publication_end_date', { ascending: true });

      if (error) {
        console.error('Error fetching licitaciones:', error);
      } else {
        setLicitaciones(data || []);
      }
      setIsLoading(false);
    }

    fetchLicitaciones();
  }, [supabase]);

  if (isLoading) {
    return <div className="text-center mt-8">Cargando licitaciones...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Licitaciones Activas</h1>
      {licitaciones.length === 0 ? (
        <p className="text-center text-gray-600">No hay licitaciones activas en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {licitaciones.map((licitacion) => (
            <div key={licitacion.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Proyecto ID: {licitacion.id}</h2>
              <p className="text-gray-600 mb-1">Partida: {licitacion.partida}</p>
              <p className="text-gray-600 mb-1">Fecha de cierre: {new Date(licitacion.publication_end_date).toLocaleDateString()}</p>
              <p className="text-gray-600 mb-1">Lugar: {licitacion.location}</p>
              <p className="text-gray-600 mb-1">Presupuesto inicial: ${licitacion.initial_budget.toLocaleString()}</p>
              <p className="text-gray-600 mb-4">Fecha de inicio: {new Date(licitacion.job_start_date).toLocaleDateString()}</p>
              <Button asChild>
                <Link href={`/proveedor/licitaciones/${licitacion.id}`}>
                  Ver Detalles
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface Cotizacion {
  id: number;
  proveedorNombre: string;
  licitacionNombre: string;
  constructoraNombre: string;
  fechaEnvio: string;
  monto: number;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

async function getCotizacion(id: string): Promise<Cotizacion> {
  // En una aplicación real, esto sería una llamada a una API
  return {
    id: parseInt(id),
    proveedorNombre: "Proveedor A",
    licitacionNombre: "Proyecto X",
    constructoraNombre: "Constructora 1",
    fechaEnvio: "2023-11-15",
    monto: 100000,
    estado: 'Pendiente'
  };
}

export default function CotizacionDetalle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);

  useEffect(() => {
    getCotizacion(params.id).then(setCotizacion);
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (cotizacion) {
      setCotizacion({
        ...cotizacion,
        [e.target.name]: e.target.name === 'monto' ? parseFloat(e.target.value) : e.target.value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los cambios
    console.log('Guardando cambios:', cotizacion);
    router.push('/admin');
  };

  if (!cotizacion) return <div>Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Editar Cotización</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="proveedorNombre">Nombre del Proveedor</Label>
          <Input
            id="proveedorNombre"
            name="proveedorNombre"
            value={cotizacion.proveedorNombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="licitacionNombre">Nombre de la Licitación</Label>
          <Input
            id="licitacionNombre"
            name="licitacionNombre"
            value={cotizacion.licitacionNombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="constructoraNombre">Nombre de la Constructora</Label>
          <Input
            id="constructoraNombre"
            name="constructoraNombre"
            value={cotizacion.constructoraNombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="fechaEnvio">Fecha de Envío</Label>
          <Input
            id="fechaEnvio"
            name="fechaEnvio"
            type="date"
            value={cotizacion.fechaEnvio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="monto">Monto</Label>
          <Input
            id="monto"
            name="monto"
            type="number"
            value={cotizacion.monto}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            name="estado"
            value={cotizacion.estado}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>
        <div className="flex justify-between">
          <Button type="submit">Guardar Cambios</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
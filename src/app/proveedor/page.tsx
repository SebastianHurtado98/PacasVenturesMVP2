import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function ProveedorDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard del Proveedor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Mis Cotizaciones</h2>
          <p className="mb-4">Revisa el estado de tus cotizaciones enviadas.</p>
          <Button asChild>
            <Link href="/proveedor/cotizaciones">Ver Cotizaciones</Link>
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Licitaciones Activas</h2>
          <p className="mb-4">Explora las licitaciones disponibles y envía tus propuestas.</p>
          <Button asChild>
            <Link href="/proveedor/licitaciones">Ver Licitaciones</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
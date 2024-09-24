'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrearLicitacion() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fechaCierre: '',
    partida: '',
    lugar: '',
    presupuestoInicial: '',
    especificacionesTecnicas: '',
    fechaInicioTrabajo: '',
    informacionAdicional: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log(formData)
    // Redirect to the dashboard after successful creation
    router.push('/constructora')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Crear Licitación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fechaCierre" className="block text-sm font-medium text-gray-700">
            Fecha de cierre de licitación
          </label>
          <input
            type="date"
            id="fechaCierre"
            name="fechaCierre"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.fechaCierre}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="partida" className="block text-sm font-medium text-gray-700">
            Partida
          </label>
          <select
            id="partida"
            name="partida"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.partida}
            onChange={handleChange}
          >
            <option value="">Seleccione una partida</option>
            <option value="electricidad">Electricidad</option>
            <option value="plomeria">Plomería</option>
            <option value="carpinteria">Carpintería</option>
          </select>
        </div>
        <div>
          <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">
            Lugar
          </label>
          <input
            type="text"
            id="lugar"
            name="lugar"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.lugar}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="presupuestoInicial" className="block text-sm font-medium text-gray-700">
            Presupuesto inicial (opcional)
          </label>
          <input
            type="number"
            id="presupuestoInicial"
            name="presupuestoInicial"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.presupuestoInicial}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="especificacionesTecnicas" className="block text-sm font-medium text-gray-700">
            Especificaciones técnicas
          </label>
          <textarea
            id="especificacionesTecnicas"
            name="especificacionesTecnicas"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.especificacionesTecnicas}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <label htmlFor="fechaInicioTrabajo" className="block text-sm font-medium text-gray-700">
            Fecha de inicio de trabajo
          </label>
          <input
            type="date"
            id="fechaInicioTrabajo"
            name="fechaInicioTrabajo"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.fechaInicioTrabajo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="informacionAdicional" className="block text-sm font-medium text-gray-700">
            Información adicional
          </label>
          <textarea
            id="informacionAdicional"
            name="informacionAdicional"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={formData.informacionAdicional}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Crear Licitación
          </button>
        </div>
      </form>
    </div>
  )
}
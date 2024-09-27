'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Hardcoded data for users
const users = [
  { id: 1, nombre: 'Juan Pérez', cargo: 'Ingeniero', email: 'juan@example.com', celular: '987654321', tipo: 'Residente', proyecto: 'Edificio Residencial Aurora' },
  { id: 2, nombre: 'María García', cargo: 'Analista', email: 'maria@example.com', celular: '987654322', tipo: 'Analista', proyecto: 'Centro Comercial Pacífico' },
  { id: 3, nombre: 'Carlos López', cargo: 'Gerente', email: 'carlos@example.com', celular: '987654323', tipo: 'Administrador', proyecto: 'Condominio Eco Verde' },
]

export default function UsuariosYPermisos() {
  const [userTypes, setUserTypes] = useState(users.map(user => user.tipo))

  const handleTypeChange = (value: string, index: number) => {
    const newUserTypes = [...userTypes]
    newUserTypes[index] = value
    setUserTypes(newUserTypes)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Usuarios y Permisos</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Correo electrónico</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Tipo de usuario</TableHead>
            <TableHead>Proyecto asignado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.cargo}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.celular}</TableCell>
              <TableCell>
                <Select value={userTypes[index]} onValueChange={(value) => handleTypeChange(value, index)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residente">Residente</SelectItem>
                    <SelectItem value="Analista">Analista</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Ingeniero">Ingeniero</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{user.proyecto}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
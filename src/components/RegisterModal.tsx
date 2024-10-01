'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import { specializations } from '@/utils/specializations'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ isOpen, onClose, onSuccess, onSwitchToLogin }: RegisterModalProps) {
  const [step, setStep] = useState(1)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'proveedor' | 'constructora' | ''>('')
  const [ruc, setRuc] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [enterpriseName, setEnterpriseName] = useState('')
  const [partidas, setPartidas] = useState<string[]>([])
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            user_name: userName,
            phone_number: phoneNumber,
            ruc: ruc,
            enterprise_name: enterpriseName,
            user_type: userType,
            partidas: userType === 'proveedor' ? partidas : null
          }
        }
      })
      if (authError) throw authError

      if (authData.user) {
        // Insert user data into the 'user' table
        const { error: userError } = await supabase
          .from('user')
          .insert({
            auth_user_id: authData.user.id,
            user_name: userName,
            email: email,
            phone_number: phoneNumber,
            ruc: ruc,
            enterprise_name: enterpriseName,
            user_type: userType,
            partidas: userType === 'proveedor' ? partidas : null
          })
        if (userError) throw userError

        // Automatically sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError

        toast({ title: "Registro exitoso", description: "Has iniciado sesión automáticamente." })
        onSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu solicitud",
        variant: "destructive",
      })
    }
  }

  const handleNumericInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setter(value)
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrarse</DialogTitle>
          <DialogDescription>
            Crea una nueva cuenta - Paso {step} de 3
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="userName">Nombre completo</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="button" onClick={nextStep} className="w-full">
                Siguiente
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer ${userType === 'proveedor' ? 'border-primary' : ''}`}
                  onClick={() => setUserType('proveedor')}
                >
                  <CardContent className="flex items-center justify-center h-32">
                    Proveedor
                  </CardContent>
                </Card>
                <Card 
                  className={`cursor-pointer ${userType === 'constructora' ? 'border-primary' : ''}`}
                  onClick={() => setUserType('constructora')}
                >
                  <CardContent className="flex items-center justify-center h-32">
                    Constructora
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={prevStep} variant="outline">
                  Anterior
                </Button>
                <Button type="button" onClick={nextStep} disabled={!userType}>
                  Siguiente
                </Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div>
                <Label htmlFor="enterpriseName">Razón Social</Label>
                <Input
                  id="enterpriseName"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={ruc}
                  onChange={handleNumericInput(setRuc)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Teléfono/Celular</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={handleNumericInput(setPhoneNumber)}
                  required
                />
              </div>
              {userType === 'proveedor' && (
                <div>
                  <Label htmlFor="partidas">Partidas</Label>
                  <MultiSelectDropdown
                    options={specializations}
                    selectedOptions={partidas}
                    onChange={setPartidas}
                  />
                </div>
              )}
              <div className="flex justify-between">
                <Button type="button" onClick={prevStep} variant="outline">
                  Anterior
                </Button>
                <Button type="submit">
                  Registrarse
                </Button>
              </div>
            </>
          )}
        </form>
        <Button
          variant="link"
          onClick={onSwitchToLogin}
          className="w-full mt-2"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </DialogContent>
    </Dialog>
  )
}
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

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [enterpriseName, setEnterpriseName] = useState('')
  const [ruc, setRuc] = useState('')
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast({ title: "Inicio de sesión exitoso" })
        onSuccess()
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              user_name: userName,
              phone_number: phoneNumber,
              enterprise_name: enterpriseName,
              ruc: ruc
            }
          }
        })
        if (authError) throw authError

        if (authData.user) {
          const { error: userError } = await supabase
            .from('user')
            .insert({
              auth_user_id: authData.user.id,
              user_name: userName,
              email: email,
              phone_number: phoneNumber,
              enterprise_name: enterpriseName,
              ruc: ruc
            })
          if (userError) throw userError
        }

        toast({ title: "Registro exitoso", description: "Por favor, verifica tu email para confirmar tu cuenta" })
        setIsLogin(true)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Ingresa tus credenciales para acceder' : 'Crea una nueva cuenta'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
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
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="userName">Nombre completo</Label>
                <Input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Teléfono</Label>
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
              <div>
                <Label htmlFor="enterpriseName">Razón Social</Label>
                <Input
                  id="enterpriseName"
                  type="text"
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
            </>
          )}
          <Button type="submit" className="w-full">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </Button>
        </form>
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-2"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
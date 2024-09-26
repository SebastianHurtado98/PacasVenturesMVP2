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
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast({ title: "Registro exitoso", description: "Por favor, inicia sesión" })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
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
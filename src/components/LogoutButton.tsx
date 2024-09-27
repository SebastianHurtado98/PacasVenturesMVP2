'use client'

import { useSupabase } from './supabase-provider'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

export default function LogoutButton() {
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} variant="ghost" className="text-black hover:bg-gray-200 bg-white">
      Cerrar sesión
    </Button>
  )
}
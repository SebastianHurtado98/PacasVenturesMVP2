'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LicitacionesProyecto from '../[id]/licitaciones/page'

export default function AllLicitaciones() {
  const router = useRouter()

  useEffect(() => {
    // This effect will run only on the client-side
    router.replace('/constructora/proyectos/all/licitaciones')
  }, [router])

  // Return null or a loading indicator while redirecting
  return null
}
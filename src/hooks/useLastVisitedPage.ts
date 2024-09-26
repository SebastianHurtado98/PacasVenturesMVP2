'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export const useLastVisitedPage = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/register') {
      localStorage.setItem('lastVisitedPage', pathname)
    }
  }, [pathname])

  const getLastVisitedPage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastVisitedPage') || '/licitaciones'
    }
    return '/licitaciones'
  }

  return { getLastVisitedPage }
}
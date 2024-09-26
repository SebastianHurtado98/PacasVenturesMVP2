'use client'

import { useLastVisitedPage } from '@/hooks/useLastVisitedPage'

export const LastVisitedPageTracker = ({ children }: { children: React.ReactNode }) => {
  useLastVisitedPage()
  return <>{children}</>
}
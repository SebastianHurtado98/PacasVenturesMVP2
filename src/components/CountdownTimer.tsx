'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endDate: string
}

function calculateTimeLeft(endDate: string): string {
  const now = new Date()
  const end = new Date(endDate)
  const difference = end.getTime() - now.getTime()

  if (difference <= 0) {
    return 'Finalizado'
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  return `${days}d ${hours}h ${minutes}m`
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <span className="text-red-600 font-bold">
      {timeLeft}
    </span>
  )
}
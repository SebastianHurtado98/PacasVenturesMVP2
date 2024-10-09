'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import CountdownTimer from '@/components/CountdownTimer'
import { specializations } from '@/utils/specializations'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/components/AuthProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Bid {
  id: number
  partida: string
  publication_end_date: string
  job_start_date: string
  initial_budget: number
  project: {
    name: string
    location: string
  }
  main_description: string
  active: boolean
  user: {
    enterprise_name: string
    company_logo: string
  }
}

type FilterStatus = 'all' | 'active' | 'inactive'

interface LicitacionesProps {
  initialBids: Bid[]
}

export default function Licitaciones({ initialBids }: LicitacionesProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { user } = useAuth()
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [filteredBids, setFilteredBids] = useState<Bid[]>(initialBids)
  const [isLoading, setIsLoading] = useState(false)
  const [partidas, setPartidas] = useState<string[]>([])
  const [selectedPartidas, setSelectedPartidas] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null)

  useEffect(() => {
    // Extract unique partidas from initialBids
    const uniquePartidas = Array.from(new Set(initialBids.map(bid => bid.partida)))
    setPartidas(uniquePartidas)
  }, [initialBids])

  useEffect(() => {
    const now = new Date()
    const filtered = bids.filter(bid => {
      const isActive = bid.active && new Date(bid.publication_end_date) > now
      const matchesPartida = selectedPartidas.length === 0 || selectedPartidas.includes(bid.partida)
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'active' && isActive) ||
        (filterStatus === 'inactive' && !isActive)
      
      return matchesPartida && matchesStatus
    })
    setFilteredBids(filtered)
  }, [selectedPartidas, bids, filterStatus])

  const handlePartidasChange = (selected: string[]) => {
    setSelectedPartidas(selected)
  }

  const handleStatusChange = (value: FilterStatus) => {
    setFilterStatus(value)
  }

  const handleViewBid = (bidId: number) => {
    router.push(`/proveedor/licitacion/${bidId}`)
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    if (selectedBidId) {
      router.push(`/proveedor/licitacion/${selectedBidId}`)
    }
  }
  
  return (
    <>
      <div className="mb-8 space-y-4">
        <div>
          <label htmlFor="partidas-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Partidas
          </label>
          <MultiSelectDropdown
            options={specializations}
            selectedOptions={selectedPartidas}
            onChange={handlePartidasChange}
          />
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Estado de Licitaciones
          </label>
          <Select onValueChange={handleStatusChange} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBids.map((bid) => {
          const isActive = bid.active && new Date(bid.publication_end_date) > new Date()
          return (
            <Card key={bid.id} className={`flex flex-col ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
              <CardHeader>
                <div className="w-full h-40 relative mb-4">
                  <Image
                    src={bid.user.company_logo || '/placeholder.svg'}
                    alt={`Logo de ${bid.user.enterprise_name}`}
                    layout="fill"
                    objectFit="contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardTitle>{bid.project?.name}</CardTitle>
                <p className="text-sm text-gray-500">{bid.user.enterprise_name}</p>
                <p className="text-sm text-gray-700 mt-2">{bid.main_description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p><strong>Partida:</strong> {bid.partida}</p>
                <p>
                  <strong>Fecha de Cierre:</strong> {new Date(bid.publication_end_date).toLocaleDateString()}
                  {' '}
                  (<CountdownTimer endDate={bid.publication_end_date} />)
                </p>
                <p><strong>Ubicación:</strong> {bid.project.location}</p>
                <p><strong>Fecha de Inicio:</strong> {new Date(bid.job_start_date).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> {isActive ? 'Activa' : 'Inactiva'}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleViewBid(bid.id)} 
                  className="w-full"
                  disabled={!isActive}
                >
                  {isActive ? 'Ver detalle y cotizar' : 'Licitación cerrada'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <Toaster />
    </>
  )
}
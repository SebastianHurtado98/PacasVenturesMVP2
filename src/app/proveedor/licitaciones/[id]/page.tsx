'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/AuthProvider'

interface Proposal {
  id: number;
  user_id: string;
  bid_id: number;
  budget: number;
  state: 'accepted' | 'rejected' | 'pending' | 'sent';
  delivery_time: string;
  payment_method: string;
  guarantee: string;
  extra_info: string;
  file_id: number | null;
}

interface Licitacion {
  id: number;
  active: boolean;
  partida: string;
  publication_end_date: string;
  location: string;
  initial_budget: number;
  job_technical_specs: string;
  job_start_date: string;
  job_details: string;
  file_id: number | null;
}

interface FileInfo {
  id: number;
  file_name: string;
  file_path: string;
}

export default function LicitacionDetalle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
  const [bidFileInfo, setBidFileInfo] = useState<FileInfo | null>(null);
  const [bidSignedUrl, setBidSignedUrl] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [newProposal, setNewProposal] = useState<Omit<Proposal, 'id' | 'user_id' | 'bid_id' | 'state' | 'file_id'>>({
    budget: 0,
    delivery_time: '',
    payment_method: '',
    guarantee: '',
    extra_info: '',
  });

  useEffect(() => {
    const fetchLicitacionAndProposals = async () => {
      try {
        const { data: licitacionData, error: licitacionError } = await supabase
          .from('bid')
          .select('*')
          .eq('id', params.id)
          .single();

        if (licitacionError) throw licitacionError;
        setLicitacion(licitacionData);

        if (licitacionData.file_id) {
          const { data: fileData, error: fileError } = await supabase
            .from('bid_doc')
            .select('*')
            .eq('id', licitacionData.file_id)
            .single();

          if (fileError) throw fileError;
          setBidFileInfo(fileData);

          if (fileData) {
            const storageFilePath = fileData.file_path.split('/').slice(-2).join('/');
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from('bid_files')
              .createSignedUrl(storageFilePath, 60);

            if (urlError) throw urlError;
            setBidSignedUrl(urlData.signedUrl);
          }
        }

        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposal')
          .select('*')
          .eq('bid_id', params.id);

        if (proposalsError) throw proposalsError;
        setProposals(proposalsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la licitación.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicitacionAndProposals();
  }, [supabase, params.id, toast]);

  const handleProposalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProposalFile(e.target.files[0]);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licitacion || !user) {
      toast({
        title: "Error",
        description: "No se pudo enviar la propuesta. Por favor, inicia sesión e intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    try {
      let file_id = null;
      if (proposalFile) {
        const fileName = `${Date.now()}_${proposalFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proposal_files')
          .upload(fileName, proposalFile);

        if (uploadError) throw uploadError;

        const { data: fileData, error: fileError } = await supabase
          .from('proposal_doc')
          .insert({ file_name: proposalFile.name, file_path: uploadData.path })
          .select()
          .single();

        if (fileError) throw fileError;
        file_id = fileData.id;
      }

      const { data: proposalData, error: proposalError } = await supabase
        .from('proposal')
        .insert({
          ...newProposal,
          user_id: user.id,
          bid_id: licitacion.id,
          state: 'sent',
          file_id,
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      setProposals([...proposals, proposalData]);

      toast({
        title: "Propuesta enviada",
        description: "Tu propuesta ha sido enviada exitosamente.",
      });

      router.push('/proveedor/cotizaciones');

    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la propuesta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const toggleProposals = () => {
    setIsProposalsOpen(!isProposalsOpen);
  };

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;
  if (!licitacion) return <div className="text-center py-10">No se encontró la licitación</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalle de Licitación</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold">{licitacion.active ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div>
            <p className="text-gray-600">Partida</p>
            <p className="font-semibold">{licitacion.partida}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de cierre</p>
            <p className="font-semibold">{new Date(licitacion.publication_end_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Lugar</p>
            <p className="font-semibold">{licitacion.location}</p>
          </div>
          <div>
            <p className="text-gray-600">Presupuesto inicial</p>
            <p className="font-semibold">${licitacion.initial_budget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de inicio de trabajo</p>
            <p className="font-semibold">{new Date(licitacion.job_start_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Especificaciones técnicas</p>
          <p className="mt-2">{licitacion.job_technical_specs}</p>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Información adicional</p>
          <p className="mt-2">{licitacion.job_details}</p>
        </div>
        {bidFileInfo && (
          <div className="mt-6">
            <p className="text-gray-600">Documento adjunto</p>
            {bidSignedUrl ? (
              <Button asChild className="mt-2">
                <a href={bidSignedUrl} download={bidFileInfo.file_name}>
                  Descargar {bidFileInfo.file_name}
                </a>
              </Button>
            ) : (
              <p className="mt-2 text-red-500">Error al generar el enlace de descarga</p>
            )}
          </div>
        )}
        {licitacion.file_id && !bidFileInfo && (
          <div className="mt-6">
            <p className="text-red-500">Error al obtener la información del archivo</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <button
          onClick={toggleProposals}
          className="flex justify-between items-center w-full text-left text-xl font-semibold mb-4"
        >
          <span>Propuestas Enviadas ({proposals.length})</span>
          {isProposalsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
        {isProposalsOpen && (
          <div className="space-y-4">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal.id} className="border p-4 rounded-md">
                  <p><strong>Presupuesto:</strong> ${proposal.budget.toLocaleString()}</p>
                  <p><strong>Estado:</strong> {proposal.state}</p>
                  <p><strong>Tiempo de entrega:</strong> {proposal.delivery_time}</p>
                  <p><strong>Método de pago:</strong> {proposal.payment_method}</p>
                  <p><strong>Garantía:</strong> {proposal.guarantee}</p>
                  <p><strong>Información adicional:</strong> {proposal.extra_info}</p>
                  {proposal.file_id && (
                    <Button asChild className="mt-2" size="sm">
                      <Link href={`/proveedor/cotizaciones/${proposal.id}`}>
                        Ver Documento
                      </Link>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p>No hay propuestas enviadas para esta licitación.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Enviar Nueva Propuesta</h2>
        <form onSubmit={handleProposalSubmit}>
          <div className="mb-4">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Presupuesto
            </label>
            <input
              type="number"
              id="budget"
              value={newProposal.budget}
              onChange={(e) => setNewProposal({...newProposal, budget: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700">
              Tiempo de entrega
            </label>
            <input
              type="text"
              id="delivery_time"
              value={newProposal.delivery_time}
              onChange={(e) => setNewProposal({...newProposal, delivery_time: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
              Método de pago
            </label>
            <input
              type="text"
              id="payment_method"
              value={newProposal.payment_method}
              onChange={(e) => setNewProposal({...newProposal, payment_method: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="guarantee" className="block text-sm font-medium text-gray-700">
              Garantía
            </label>
            <input
              type="text"
              id="guarantee"
              value={newProposal.guarantee}
              onChange={(e) => setNewProposal({...newProposal, guarantee: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="extra_info" className="block text-sm font-medium text-gray-700">
              Información Adicional
            </label>
            <textarea
              id="extra_info"
              value={newProposal.extra_info}
              onChange={(e) => setNewProposal({...newProposal, extra_info: e.target.value})}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="proposal-pdf" className="block text-sm font-medium text-gray-700">
              Documento de la propuesta (PDF)
            </label>
            <input
              type="file"
              id="proposal-pdf"
              accept=".pdf"
              onChange={handleProposalFileChange}
              className="mt-1 block w-full"
            />
          </div>
          <Button type="submit">Enviar Propuesta</Button>
        </form>
      </div>
      <Toaster />
    </div>
  )
}
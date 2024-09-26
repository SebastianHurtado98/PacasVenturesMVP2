'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Proposal {
  id: number;
  bid_id: number;
  budget: number;
  state: 'sent' | 'accepted' | 'rejected';
  created_at: string;
  delivery_time: string;
  payment_method: string;
  guarantee: string;
  file_id: number | null;
}

interface Bid {
  id: number;
  partida: string;
  publication_end_date: string;
  location: string;
  job_technical_specs: string;
  job_start_date: string;
}

interface FileInfo {
  id: number;
  file_name: string;
  file_path: string;
}

export default function DetalleCotizacion({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposal')
          .select('*')
          .eq('id', params.id)
          .single();

        if (proposalError) throw proposalError;

        if (proposalData) {
          setProposal(proposalData);

          const { data: bidData, error: bidError } = await supabase
            .from('bid')
            .select('*')
            .eq('id', proposalData.bid_id)
            .single();

          if (bidError) throw bidError;

          if (bidData) {
            setBid(bidData);
          }

          if (proposalData.file_id) {
            const { data: fileData, error: fileError } = await supabase
              .from('proposal_doc')
              .select('*')
              .eq('id', proposalData.file_id)
              .single();

            if (fileError) throw fileError;

            if (fileData) {
              setFileInfo(fileData);
              
              // Generate a signed URL for the file
              const { data: urlData, error: urlError } = await supabase
                .storage
                .from('proposal_files')
                .createSignedUrl(fileData.file_path, 60 * 60); // URL valid for 1 hour

              if (urlError) throw urlError;

              if (urlData) {
                setFileUrl(urlData.signedUrl);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la cotización.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, params.id, toast]);

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;
  if (!proposal || !bid) return <div className="text-center py-10">No se encontró la cotización</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalle de Cotización</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Cotización</h2>
        <p><strong>ID de Licitación:</strong> {proposal.bid_id}</p>
        <p><strong>Fecha de Envío:</strong> {new Date(proposal.created_at).toLocaleDateString()}</p>
        <p><strong>Monto:</strong> ${proposal.budget.toLocaleString()}</p>
        <p><strong>Estado:</strong> {proposal.state}</p>
        <p><strong>Plazo de Entrega:</strong> {proposal.delivery_time}</p>
        <p><strong>Forma de Pago:</strong> {proposal.payment_method}</p>
        <p><strong>Garantía:</strong> {proposal.guarantee}</p>
        {fileInfo && fileUrl && (
          <div className="mt-4">
            <p><strong>Archivo adjunto:</strong> {fileInfo.file_name}</p>
            <Button onClick={handleDownload} className="mt-2">
              Descargar Archivo de Propuesta
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Licitación</h2>
        <p><strong>Partida:</strong> {bid.partida}</p>
        <p><strong>Fecha de Cierre:</strong> {new Date(bid.publication_end_date).toLocaleDateString()}</p>
        <p><strong>Lugar:</strong> {bid.location}</p>
        <p><strong>Fecha de Inicio de Trabajo:</strong> {new Date(bid.job_start_date).toLocaleDateString()}</p>
        <p><strong>Especificaciones Técnicas:</strong> {bid.job_technical_specs}</p>
      </div>

      <Button onClick={() => router.push('/proveedor/cotizaciones')}>
        Volver a Mis Cotizaciones
      </Button>
      <Toaster />
    </div>
  );
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from 'lucide-react'
import { useSupabase } from '@/components/supabase-provider'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/components/AuthProvider'
import CountdownTimer from '@/components/CountdownTimer'
import { AuthModal } from '@/components/AuthModal'
import { BASE_URL, WHATSAPP_NUMBER } from '@/utils/constants'
import Link from 'next/link'

interface Proposal {
  id: number;
  user_id: number;
  bid_id: number;
  state: 'accepted' | 'rejected' | 'pending' | 'sent';
  extra_info: string;
}

interface ProposalFileInfo {
  id: number;
  proposal_id: number;
  file_name: string;
  file_path: string;
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
  project: {
    name: string,
    location: string,
  };
  created_at: string;
  company_logo: string;
  description: string;
  user: {
    enterprise_name: string;
  };
}

interface FileInfo {
  id: number;
  file_name: string;
  file_path: string;
  bid_id: number;
}

interface LinkInfo {
  id: number;
  link: string;
  link_name: string;
  bid_id: number;
}

interface UserData {
  id: number;
  user_type: string;
}

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function LicitacionDetalle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null);
  const [bidFiles, setBidFiles] = useState<FileInfo[]>([]);
  const [bidLinks, setBidLinks] = useState<LinkInfo[]>([]);
  const [bidSignedUrls, setBidSignedUrls] = useState<{ [key: number]: string }>({});
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalFiles, setProposalFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalsOpen, setIsProposalsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState<Omit<Proposal, 'id' | 'user_id' | 'bid_id' | 'state'>>({extra_info: ''});
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user')
            .select('id, user_type')
            .eq('auth_user_id', user.id)
            .single();
        
          if (error) throw error;
          setUserData(data);
          setUserDataLoaded(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserDataLoaded(true);
        }
      } else {
        setUserDataLoaded(true);
      }
    };

    fetchUserData();
  }, [user, supabase]);

  useEffect(() => {
    const fetchLicitacionAndProposals = async () => {
      try {
        const { data: licitacionData, error: licitacionError } = await supabase
          .from('bid')
          .select(`
            *,
            project (name, location),
            user (enterprise_name)
          `)
          .eq('id', params.id)
          .single();

        if (licitacionError) throw licitacionError;
        setLicitacion(licitacionData);

        const { data: filesData, error: filesError } = await supabase
          .from('bid_doc')
          .select('*')
          .eq('bid_id', params.id);

        if (filesError) throw filesError;
        setBidFiles(filesData || []);

        const { data: linksData, error: linksError } = await supabase
          .from('bid_link')
          .select('*')
          .eq('bid_id', params.id);

        if (linksError) throw linksError;
        setBidLinks(linksData || []);

        const signedUrls: { [key: number]: string } = {};
        for (const file of filesData || []) {
          const storageFilePath = file.file_path.split('/').slice(-2).join('/');
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('bid_files')
            .createSignedUrl(storageFilePath, 60);

          if (urlError) throw urlError;
          signedUrls[file.id] = urlData.signedUrl;
        }
        setBidSignedUrls(signedUrls);

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

    if (userDataLoaded) {
      fetchLicitacionAndProposals();
    }
  }, [supabase, params.id, toast, userDataLoaded]);

  const handleProposalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProposalFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files || [])]);
    }
  };

  const removeProposalFile = (index: number) => {
    setProposalFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licitacion || !userData) {
      toast({
        title: "Error",
        description: "No se pudo enviar la cotización. Por favor, inicia sesión e intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposal')
        .insert({
          ...newProposal,
          user_id: userData.id,
          bid_id: licitacion.id,
          state: 'sent',
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      for (const file of proposalFiles) {
        const cleanFileName = removeAccents(file.name);
        const fileName = `${Date.now()}_${cleanFileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proposal_files')
          .upload(fileName, file);
      
        if (uploadError) throw uploadError;
      
        const { error: fileError } = await supabase
          .from('proposal_doc')
          .insert({ 
            proposal_id: proposalData.id,
            file_name: file.name,
            file_path: uploadData.path 
          });
      
        if (fileError) throw fileError;
      }

      setProposals([...proposals, proposalData]);

      toast({
        title: "cotización enviada",
        description: "Tu cotización ha sido enviada exitosamente.",
      });

      router.push('/proveedor/mis-cotizaciones');

    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la cotización. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const toggleProposals = () => {
    setIsProposalsOpen(!isProposalsOpen);
  };

  const handleWhatsAppQuestion = () => {
    if (licitacion) {
      const message = encodeURIComponent(`¡Hola! Tengo una consulta sobre la siguiente licitación en Licibit: ${BASE_URL}/licitacion/${licitacion.id}`);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    window.location.reload();
  };

  if (isLoading) return <div className="text-center py-10">Cargando...</div>;
  if (!licitacion) return <div className="text-center py-10">No se encontró la licitación</div>;

  const isActive = licitacion.active && new Date(licitacion.publication_end_date) > new Date();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{licitacion.project.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 relative mr-4">
            <Image
              src={licitacion.company_logo || '/placeholder.svg'}
              alt={`Logo de ${licitacion.user.enterprise_name}`}
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{licitacion.user.enterprise_name}</h2>
            <p className="text-gray-600">Creado el: {new Date(licitacion.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Estado</p>
            <p className="font-semibold">{isActive ? 'Activa' : 'Inactiva'}</p>
          </div>
          <div>
            <p className="text-gray-600">Partida</p>
            <p className="font-semibold">{licitacion.partida}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de cierre</p>
            <p className="font-semibold">
              {new Date(licitacion.publication_end_date).toLocaleDateString()}
              {' '}
              (<CountdownTimer endDate={licitacion.publication_end_date} />)
            </p>
          </div>
          <div>
            <p className="text-gray-600">Lugar</p>
            <p className="font-semibold">{licitacion.project.location}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha de inicio de trabajo</p>
            <p className="font-semibold">{new Date(licitacion.job_start_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">Detalles del requerimiento</p>
          <p className="mt-2">{licitacion.description}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-2">Documentos adjuntos</p>
            {bidFiles.length > 0 ? (
              bidFiles.map((file) => (
                <div key={file.id} className="mt-2">
                  {bidSignedUrls[file.id] ? (
                    <Button asChild className="w-full mb-2">
                      <a href={bidSignedUrls[file.id]} download={file.file_name} target="_blank">
                        Descargar {file.file_name}
                      </a>
                    </Button>
                  ) : (
                    <p className="text-red-500">Error al generar el enlace de descarga para {file.file_name}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No hay documentos adjuntos</p>
            )}
          </div>
          <div>
            <p className="text-gray-600 mb-2">Vínculos adjuntos</p>
            {bidLinks.length > 0 ? (
              bidLinks.map((link) => (
                <Button key={link.id} asChild className="w-full mb-2">
                  <a href={link.link} target="_blank" rel="noopener noreferrer">
                    Ver {link.link_name}
                  </a>
                </Button>
              ))
            ) : (
              <p>No hay vínculos adjuntos</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleWhatsAppQuestion}>
            Hacer pregunta
          </Button>
        </div>
      </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enviar Nueva Cotización</h2>
          {user ? (
            isActive ? (
              <form onSubmit={handleProposalSubmit}>
                <div className="mb-4">
                  <label htmlFor="extra_info" className="block text-sm font-medium text-gray-700">
                    Comentarios
                  </label>
                  <textarea
                    id="extra_info"
                    value={newProposal.extra_info}
                    onChange={(e) => setNewProposal({...newProposal, extra_info: e.target.value})}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div  className="mb-4">
                  <label htmlFor="proposal-files" className="block text-sm font-medium text-gray-700">
                    Archivos de la cotización
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="proposal-files"
                      onChange={handleProposalFileChange}
                      className="hidden"
                      multiple
                    />
                    <label
                      htmlFor="proposal-files"
                      className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-5 w-5 inline-block mr-2" />
                      Agregar archivo
                    </label>
                  </div>
                  <div className="mt-2">
                    {proposalFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProposalFile(index)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit">Enviar Cotización</Button>
                <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/proveedor/mis-cotizaciones/">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-white text-black border-gray-300 hover:bg-gray-100"
                  >
                    Ver mis cotizaciones
                  </Button>
                  </Link>
                </div>
              </form>
            ) : (
              <p className="text-red-500">Esta licitación ya no está activa. No se pueden enviar cotizaciones.</p>
            )
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Si quieres enviar una cotización, inicia sesión</h2>
              <Button onClick={() => setIsAuthModalOpen(true)}>Iniciar Sesión</Button>
            </div>
          )}
        </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <Toaster />
    </div>
  )
}
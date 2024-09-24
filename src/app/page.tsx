import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido al Sistema de Licitaciones
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Conectamos constructoras y proveedores para simplificar el proceso de licitaciones
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/register">
                Registrarse
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Para Constructoras"
            description="Publique licitaciones y reciba cotizaciones de proveedores calificados."
            icon={<BuildingIcon className="w-12 h-12 text-blue-500" />}
          />
          <FeatureCard
            title="Para Proveedores"
            description="Encuentre oportunidades de negocio y envíe sus cotizaciones fácilmente."
            icon={<ToolsIcon className="w-12 h-12 text-green-500" />}
          />
          <FeatureCard
            title="Proceso Simplificado"
            description="Gestione todo el proceso de licitación en una sola plataforma."
            icon={<ChartIcon className="w-12 h-12 text-purple-500" />}
          />
        </div>
      </main>

      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 Sistema de Licitaciones. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function BuildingIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}

function ToolsIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 22v-5l5-5 5 5-5 5z" />
      <path d="M16 3h5v5" />
      <path d="M21 3l-9 9" />
      <path d="M10 14 4.9 3.9" />
      <path d="M10 14 3 21" />
    </svg>
  )
}

function ChartIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
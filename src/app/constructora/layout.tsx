import Link from 'next/link'

export default function ConstructoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 h-screen p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/constructora" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/constructora/crear-licitacion" className="text-blue-600 hover:underline">
                Crear Licitación
              </Link>
            </li>
            {/* Agrega más enlaces de navegación según sea necesario */}
          </ul>
        </nav>
      </aside>
      <div className="flex-grow p-6">
        {children}
      </div>
    </div>
  )
}
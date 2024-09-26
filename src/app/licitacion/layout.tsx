import Link from 'next/link'

export default function ProveedorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Licitaciones
              </Link>
            </li>
            <li>
              <Link href="/proveedor/cotizaciones" className="text-blue-600 hover:underline">
                Mis Cotizaciones
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-grow p-6">
        {children}
      </main>
    </div>
  )
}
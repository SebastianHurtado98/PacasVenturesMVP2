import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Lista de rutas públicas
  const publicRoutes = ['/', '/login', '/register', '/licitacion']

  // Verifica si la ruta actual está en la lista de rutas públicas
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Si no es una ruta pública y no hay sesión, redirige al login
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si hay sesión, verifica el tipo de usuario
  if (session) {
    const userType = session.user.user_metadata.user_type

    // Rutas específicas para constructoras
    if (req.nextUrl.pathname.startsWith('/constructora') && userType !== 'constructora') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Rutas específicas para proveedores
    if (req.nextUrl.pathname.startsWith('/proveedor') && userType !== 'proveedor') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
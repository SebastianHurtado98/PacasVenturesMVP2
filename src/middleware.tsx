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
  const publicRoutes = ['/', '/login', '/register']

  console.log("RES", res)
  console.log("PATH", req.nextUrl.pathname)

  // Si no es una ruta pública y no hay sesión, redirige a la landing page
  if (!publicRoutes.includes(req.nextUrl.pathname) && !session) {
    console.log("Redirecting to landing page: No session and not a public route")
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|img/).*)',
  ],
}
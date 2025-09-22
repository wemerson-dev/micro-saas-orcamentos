// middleware.ts (na raiz do projeto frontend)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register', '/reset-password', '/auth/callback']
  
  // Rotas protegidas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/orcamentos', '/clientes', '/usuarios']

  // Se estiver tentando acessar uma rota protegida sem estar logado
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se estiver logado e tentando acessar rotas públicas, redirecionar para dashboard
  if (publicRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
    */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
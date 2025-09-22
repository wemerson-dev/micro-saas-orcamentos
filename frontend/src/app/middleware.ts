// middleware.ts (na raiz do projeto frontend)
/*
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
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
*/

/*
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Esta função pode ser marcada como `async` se você precisar usar `await`
export function middleware(request: NextRequest) {
  // 1. Pega o token dos cookies da requisição
  const token = request.cookies.get('token')?.value

  // 2. Se o usuário não tem token e está tentando acessar uma rota protegida (ex: /dashboard)
  //    redireciona para a página de login.
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Se o usuário TEM um token e está tentando acessar a página de login,
  //    redireciona para o dashboard. Isso evita que usuários logados vejam a tela de login.
  if (token && request.nextUrl.pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // 4. Se nenhuma das condições acima for atendida, permite que a requisição continue.
  return NextResponse.next()
}

// O `matcher` define em quais rotas o middleware será executado.
// Isso é mais eficiente do que executar em todas as requisições.
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
*/

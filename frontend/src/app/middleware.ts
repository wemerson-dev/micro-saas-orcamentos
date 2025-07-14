import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login';

  // Se o usuário tem token e está tentando acessar a página de login,
  // redireciona para o dashboard.
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se o usuário não tem token e está tentando acessar uma página protegida,
  // redireciona para a página de login.
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// O matcher define quais rotas serão interceptadas pelo middleware.
export const config = {
  matcher: [
    // Intercepta todas as rotas, exceto as de API, arquivos estáticos do Next.js e arquivos públicos.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


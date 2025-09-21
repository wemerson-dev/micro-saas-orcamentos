import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Erro no callback:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
      }
    } catch (error) {
      console.error('Erro no callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }
  }

  // Redirecionar para dashboard após sucesso
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
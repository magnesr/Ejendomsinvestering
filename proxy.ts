import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Opdater session (vigtigt — må ikke fjernes)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Beskyt dashboard-routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Portefølje kræver investor-plan
    if (pathname.startsWith('/dashboard/portefolje')) {
      const { data: profil } = await supabase
        .from('profiles')
        .select('abonnement_type, abonnement_status')
        .eq('id', user.id)
        .single()

      if (
        !profil ||
        profil.abonnement_type !== 'investor' ||
        profil.abonnement_status !== 'aktiv'
      ) {
        return NextResponse.redirect(
          new URL('/priser?upgrade=investor', request.url)
        )
      }
    }
  }

  // Omdiriger loggede brugere væk fra auth-sider
  if ((pathname === '/login' || pathname === '/opret-konto') && user) {
    return NextResponse.redirect(new URL('/dashboard/oversigt', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

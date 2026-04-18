import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { CompanyWithSubscription } from '@/types/auth.types'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static files, API routes (except when needed), and Next.js internals
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  const publicRoutes = ['/login', '/register', '/forgot-password', '/pricing', '/', '/api/webhooks']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route) || pathname === route)

  const { supabase, supabaseResponse, user } = await updateSession(request)

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // If user is logged in, restrict access to auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // We fetch the profile to check if onboarding is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    const isSuperAdmin = profile?.role === 'platform_admin'

    // Protect super-admin routes
    if (pathname.startsWith('/super-admin') && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Onboarding routes (based on the group route structure)
    const onboardingRoutes = ['/company', '/warehouse', '/sample-data']
    const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route))

    if (!profile?.company_id && !isOnboardingRoute && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/company', request.url))
    }
    
    // Check subscription status if user has a company_id and is navigating to dashboard
    if (profile?.company_id && pathname.startsWith('/dashboard')) {
      const { data: companyData } = await supabase
        .from('companies')
        .select(`
          id,
          subscriptions (
            status,
            current_period_end
          )
        `)
        .eq('id', profile.company_id)
        .single()
      
      const company = companyData as unknown as CompanyWithSubscription
      const subscription = company?.subscriptions?.[0]

      if (subscription) {
        const { status, current_period_end } = subscription
        const isExpired = current_period_end ? new Date(current_period_end) < new Date() : false

        if (status === 'past_due' || status === 'canceled' || (status === 'trialing' && isExpired)) {
            return NextResponse.redirect(new URL('/billing/expired', request.url))
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

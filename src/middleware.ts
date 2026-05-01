import { NextResponse, type NextRequest } from 'next/server'
import { decodeJwtPayload } from '@/lib/auth/jwt-payload'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static files and Next.js internals
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // `pathname` دائمًا يبدأ بـ `/`؛ إدراج `"/"` وحدها كسابقة يلغي فصل المسارات (كل شيء يطابق)
  const isPublicRoute = (() => {
    if (pathname === '/') return true
    const asPrefix = (base: string) => pathname === base || pathname.startsWith(`${base}/`)
    return (
      [
        '/login',
        '/register',
        '/forgot-password',
        '/pricing',
        '/terms',
        '/privacy',
        '/api/webhooks',
      ].some((base) => asPrefix(base)) || pathname.startsWith('/api/auth/refresh')
    )
  })()

  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  const backendApiUrl =
    process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:4000'
  const anyBackendFlagEnabled =
    process.env.BACKEND_FLAG_ONBOARDING === '1' ||
    process.env.BACKEND_FLAG_FINANCE === '1' ||
    process.env.BACKEND_FLAG_REPORTS === '1' ||
    process.env.BACKEND_FLAG_ADMIN === '1' ||
    process.env.BACKEND_FLAG_INVENTORY === '1'

  try {
    // Verify session with backend (when backend flags are enabled).
    if (anyBackendFlagEnabled) {
      const cookieHeader = request.cookies
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ')

      const response = await fetch(`${backendApiUrl}/v1/auth/session`, {
        headers: {
          Cookie: cookieHeader || `access_token=${accessToken}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        if (!isPublicRoute) {
          return NextResponse.redirect(new URL('/login', request.url))
        }
        return NextResponse.next()
      }

      const json = (await response.json()) as Record<string, unknown>
      const payload =
        json?.success === true && json?.data != null && typeof json.data === 'object'
          ? (json.data as Record<string, unknown>)
          : json
      const profile = (payload?.profile ?? null) as Record<string, unknown> | null
      const subscription = payload?.subscription
      const user = payload?.user

      const jwtPayload = decodeJwtPayload(accessToken)
      const jwtCompanyId =
        typeof jwtPayload?.companyId === 'string' && jwtPayload.companyId.length > 0
          ? jwtPayload.companyId
          : null

      const companyId =
        (typeof profile?.company_id === 'string' && profile.company_id) ||
        (typeof profile?.companyId === 'string' && profile.companyId) ||
        jwtCompanyId ||
        null

      if (user && typeof user === 'object') {
        // Prevent access to auth pages if logged in
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        const isSuperAdmin = profile?.role === 'platform_admin' || profile?.role === 'admin'

        // Protect super-admin routes
        if (pathname.startsWith('/super-admin') && !isSuperAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Onboarding routes
        const onboardingRoutes = ['/onboarding/company', '/onboarding/warehouse', '/onboarding/sample-data']
        const isOnboardingRoute = onboardingRoutes.some((route) => pathname.startsWith(route))

        if (!companyId && !isOnboardingRoute && !isSuperAdmin) {
          return NextResponse.redirect(new URL('/onboarding/company', request.url))
        }

        // Protect users settings page
        if (pathname.startsWith('/dashboard/settings/users') && !isSuperAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Subscription check (block dashboard writes by redirecting to expired)
        if (companyId && pathname.startsWith('/dashboard') && subscription && typeof subscription === 'object') {
          const st = (subscription as { status?: string }).status
          if (st === 'past_due' || st === 'cancelled' || st === 'expired') {
            return NextResponse.redirect(new URL('/billing/expired', request.url))
          }
        }
      }
    }
  } catch (error) {
    // فشل الشبكة (مثلاً الباكند متوقف) — لا تعيد التوجيه إلى /login وكأن الجلسة باطلة
    if (process.env.NODE_ENV === 'development') {
      console.warn('Middleware: تعذر التحقق من الجلسة عند الباكند. تحقق من BACKEND_API_URL ومن تشغيله على 4000.', error)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

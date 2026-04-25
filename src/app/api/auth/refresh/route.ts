import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.BACKEND_API_URL ?? 'http://localhost:4000'

function cookieHeaderFromRequest(req: NextRequest): string {
  return req.cookies
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

/**
 * Proxies POST /v1/auth/refresh to the Nest backend so Set-Cookie applies on the
 * Next.js origin (same-site). Direct browser→:4000 refresh can fail CORS / cookie rules.
 */
export async function POST(req: NextRequest) {
  const cookie = cookieHeaderFromRequest(req)
  const res = await fetch(`${BASE}/v1/auth/refresh`, {
    method: 'POST',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  })

  const body = await res.text()
  const out = new NextResponse(body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
    },
  })

  const raw = res.headers as unknown as { getSetCookie?: () => string[] }
  const setCookies = typeof raw.getSetCookie === 'function' ? raw.getSetCookie() : []
  for (const c of setCookies) {
    out.headers.append('Set-Cookie', c)
  }

  return out
}

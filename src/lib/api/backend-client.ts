/** في المتصفح لا يُعرَّف إلا `NEXT_PUBLIC_*`؛ `BACKEND_API_URL` وحده يعمل في RSC/Route Handlers فقط */
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  process.env.BACKEND_API_URL ??
  'http://localhost:4000'

type ApiOk<T> = { success: true; data: T }
type ApiErr = { success: false; error: { code: string; message: string; details?: unknown } }

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  companyId?: string
  userId?: string
  idempotencyKey?: string
}

export class BackendApiError extends Error {
  code: string
  details?: unknown
  status?: number

  constructor(args: { code: string; message: string; details?: unknown; status?: number }) {
    super(args.message)
    this.name = 'BackendApiError'
    this.code = args.code
    this.details = args.details
    this.status = args.status
  }
}

export async function backendFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isServer = typeof window === 'undefined'
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (options.companyId) headers['x-company-id'] = options.companyId
  if (options.userId) headers['x-user-id'] = options.userId
  if (options.idempotencyKey) headers['idempotency-key'] = options.idempotencyKey

  // Handle cookies based on environment
  const fetchOptions: RequestInit = {
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  }

  if (isServer) {
    // Dynamically import next/headers to avoid client-side bundling issues
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const cookieHeader = allCookies
      .map((item) => `${item.name}=${item.value}`)
      .join('; ')
    
    headers['cookie'] = cookieHeader

    // Auto-extract companyId from token cookie if missing
    if (!headers['x-company-id']) {
      const tokenCookie = allCookies.find(c => ['access_token', 'jwt', 'accessToken'].includes(c.name))?.value
      if (tokenCookie) {
        try {
          // Robust JWT header/payload splitting
          const parts = tokenCookie.split('.')
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
            const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
            const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
            if (payload.companyId) {
              headers['x-company-id'] = payload.companyId
            }
            if (payload.id && !headers['x-user-id']) {
              headers['x-user-id'] = payload.id
            }
          }
        } catch (e) {
          console.error('Error auto-parsing token cookie context:', e)
        }
      }
    }
  } else {
    // On client, browser handles cookies via credentials
    fetchOptions.credentials = 'include'
  }

  const normalizedPath = path.startsWith('/v1/') || path === '/v1' ? path : `/v1${path.startsWith('/') ? '' : '/'}${path}`

  const response = await fetch(`${BASE_URL}${normalizedPath}`, {
    ...fetchOptions,
    headers,
  })

  const text = await response.text()
  const json: unknown = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : null

  if (json && typeof json === 'object' && 'success' in (json as any)) {
    const envelope = json as ApiOk<unknown> | ApiErr
    if (envelope.success === true && 'data' in envelope) {
      return envelope.data as T
    }
    if (envelope.success === false) {
      const err = envelope.error
      throw new BackendApiError({
        code: err?.code ?? 'BACKEND_ERROR',
        message: err?.message ?? 'Backend error',
        details: err?.details,
        status: response.status,
      })
    }
  }

  if (!response.ok) {
    throw new BackendApiError({
      code: 'HTTP_ERROR',
      message: typeof json === 'string' && json ? json : `Backend request failed with ${response.status}`,
      status: response.status,
    })
  }

  return json as T
}

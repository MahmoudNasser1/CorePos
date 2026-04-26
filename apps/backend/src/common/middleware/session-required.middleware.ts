import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'

@Injectable()
export class SessionRequiredMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const url = req.originalUrl ?? req.url ?? ''

    // Public / non-sensitive routes
    if (
      url.includes('/v1/auth') ||
      url.includes('/auth') ||
      url.includes('/v1/health') ||
      url.includes('/health') ||
      url.includes('/v1/readiness') ||
      url.includes('/readiness') ||
      url.startsWith('/docs') ||
      url.includes('/v1/onboarding') ||
      url.includes('/onboarding')
    ) {
      return next()
    }

    const token = req.cookies?.access_token || req.cookies?.jwt || req.cookies?.accessToken

    // Dev-only bypass for local tooling/tests (never in production)
    const hasDevTenantHeaders = Boolean(req.header('x-company-id'))
    if (process.env.NODE_ENV !== 'production' && !token && hasDevTenantHeaders) {
      return next()
    }

    if (!token) {
      throw new UnauthorizedException({
        code: 'SESSION_MISSING',
        message: 'Missing session cookie',
      })
    }

    return next()
  }
}


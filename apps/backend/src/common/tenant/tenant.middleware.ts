import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { runWithTenant } from './tenant-context'
import jwt from 'jsonwebtoken'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger('TenantMiddleware')
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret'

  use(req: Request, _res: Response, next: NextFunction) {
    let companyId = req.header('x-company-id') ?? null
    let userId = req.header('x-user-id') ?? null

    // Allow a direct company_id cookie (non-httpOnly) for UX/dev convenience.
    if (!companyId && req.cookies?.company_id) {
      companyId = String(req.cookies.company_id)
      req.headers['x-company-id'] = companyId
    }

    // If headers are missing, try extracting from cookies/JWT
    if (!companyId || !userId) {
      // Canonical cookie names: access_token, refresh_token, company_id
      // Keep backward compatibility for older cookie names during migration.
      const token = req.cookies?.access_token || req.cookies?.jwt || req.cookies?.accessToken
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.secret) as any
          companyId = companyId || decoded.companyId || null
          userId = userId || decoded.id || null
          
          // Inject into headers so Controllers can still use @Headers('x-company-id')
          if (companyId) req.headers['x-company-id'] = companyId
          if (userId) req.headers['x-user-id'] = userId
        } catch (error: any) {
          this.logger.warn(`Failed to verify token from cookie: ${error.message}`)
        }
      }
    }

    runWithTenant({ companyId, userId }, () => next())
  }
}

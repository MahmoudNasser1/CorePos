import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'node:crypto'

type RequestWithId = Request & { id?: string }

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const header = req.header('x-request-id') || req.header('x-correlation-id')
    const id = header && header.trim() ? header.trim() : randomUUID()
    req.id = id
    res.setHeader('x-request-id', id)
    next()
  }
}


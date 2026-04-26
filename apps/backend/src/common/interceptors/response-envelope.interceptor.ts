import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'

type SuccessEnvelope = { success: true; data?: unknown } & Record<string, unknown>
type ErrorEnvelope = { success: false } & Record<string, unknown>

function isAlreadyEnveloped(value: unknown): value is SuccessEnvelope | ErrorEnvelope {
  return typeof value === 'object' && value !== null && 'success' in value
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (isAlreadyEnveloped(data)) return data
        return { success: true, data }
      }),
    )
  }
}


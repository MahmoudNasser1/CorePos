import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (process.env.HTTP_ACCESS_LOG === '0') {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest<Request & { id?: string }>()
    const method = request.method
    const path = request.url
    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start
        const rid = request.id ? ` rid=${request.id}` : ''
        // Use Nest logger (log policy can be enforced at runtime via envs).
        // Keep this as a single-line access log.
        this.logger.log(`${method} ${path} ${elapsed}ms${rid}`)
      }),
    )
  }
}
